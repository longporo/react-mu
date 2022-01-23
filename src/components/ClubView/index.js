import React from "react";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {compose} from "recompose";
import {withFirebase} from "../Firebase";
import {withAuthorization} from "../Session";
import Box from "@material-ui/core/Box";
import {styled} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import green from "@material-ui/core/colors/green";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

import {CLUB_IMG_PATH} from "../../constants/sysUrls";
import * as MyUtils from "../../common/myUtils";

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 550,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const SubItem = styled(Grid)(({ theme }) => ({
    ...theme.typography.body2,
    display: 'flex',
    justifyContent: 'center',
    margin: 20,
    color: theme.palette.text.secondary,
}));

const inputStyle = {
    marginTop: '10px',
    marginBottom: '10px',
};

const FileInput = styled('input')({
    display: 'none',
});

function ClubViewPage(props) {

    const {club, authUser, firebase, onClose} = props;

    // upload img loading
    const [imgLoading, setImgLoading] = React.useState(false);

    // form submit loading
    const [submitLoading, setSubmitLoading] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);

    // error dialog open
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogMsg, setDialogMsg] = React.useState(false);

    // hook form define
    const {handleSubmit, control, setValue} = useForm();

    // submit form
    const onSubmit = (data) => {
        setSubmitLoading(true);
        // merge form data to updateData
        Object.assign(club, data);
        firebase.updateClub(club).then(() => {
            setSubmitLoading(false);
            setSubmitSuccess(true);
            setDialogOpen(true);
            setDialogMsg("Club has been updated!");
        }).catch((value) => {
            setSubmitLoading(false);
            alert(value);
        });
    };

    // upload img event
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const filePath = CLUB_IMG_PATH + MyUtils.genFileId(file.name);

        setImgLoading(true);
        firebase.uploadFile(file, filePath).then((value) => {
            firebase.getDownloadURL(value.ref).then((value) => {
                setImgLoading(false);
                setValue("logo_url", value);
            }).catch(function onRejected(error){
                uploadFailedHandle(error);
            });
        }).catch(function onRejected(error){
            uploadFailedHandle(error);
        });
    };

    // handle error dialog close
    const handleDialogClose = () => {
        setDialogOpen(false);
        if (submitSuccess) {
            onClose();
        }
    };

    // upload failed handle
    const uploadFailedHandle = (msg) => {
        setImgLoading(false);
        setDialogMsg(msg);
        setDialogOpen(true);
    };

    return (
        <Box m={4}>
            <Grid container spacing={2} sx={{display: 'flex',
                justifyContent: 'center',}}>
                <Item>
                    <form style={{width: "85%"}} onSubmit={handleSubmit(onSubmit)}>
                        <SubItem>
                            <Controller
                                name="logo_url"
                                control={control}
                                defaultValue={club.logo_url}
                                render={({ field: {value }}) => (
                                    <Avatar
                                        value={value}
                                        src={value}
                                        sx={{ width: 150, height: 150, border: 'solid #c4c4c4 1px'}}
                                    />
                                )}
                            />
                        </SubItem>
                        {authUser.uid === club.create_id && (
                            <SubItem>
                                <label htmlFor="icon-button-file">
                                    <FileInput accept="image/*" id="icon-button-file" type="file" onChange={onFileChange} />
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={imgLoading}
                                    >
                                        UPLOAD
                                    </Button>
                                    {imgLoading && (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                color: green[500],
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-35px',
                                                marginLeft: '-20px',
                                            }}
                                        />
                                    )}
                                </label>
                            </SubItem>
                        )}
                        <Controller
                            name="club_name"
                            control={control}
                            defaultValue={club.club_name}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <TextField
                                    disabled={authUser.uid !== club.create_id}
                                    sx={inputStyle}
                                    label="Club name"
                                    variant="outlined"
                                    value={value}
                                    onChange={onChange}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                />
                            )}
                            rules={{
                                required: 'Entry required',
                                maxLength: {
                                    value: 15,
                                    message: 'Entry cannot exceed 15 characters',
                                },
                            }}
                        />

                        <Controller
                            name="desc"
                            control={control}
                            defaultValue={club.desc}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <TextField
                                    disabled={authUser.uid !== club.create_id}
                                    sx={inputStyle}
                                    label="Description"
                                    fullWidth
                                    multiline
                                    value={value}
                                    onChange={onChange}
                                    rows={3}
                                    variant="outlined"
                                />
                            )}
                        />

                        {authUser.uid === club.create_id && (
                            <Button
                                sx={{marginTop: "20px"}}
                                type="submit"
                                variant="contained"
                                disabled={submitLoading}
                            >
                                Update Club
                            </Button>
                        )}
                    </form>
                </Item>
            </Grid>

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                maxWidth={"xs"}
                fullWidth={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Tips"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogMsg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Okay</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
const condition = authUser => !!authUser;
export default compose(withFirebase, withAuthorization(condition))(ClubViewPage);