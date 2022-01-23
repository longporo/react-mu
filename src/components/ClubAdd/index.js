import React from "react";
import {Controller} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {compose} from "recompose";
import {withFirebase} from "../Firebase";
import {withAuthorization, withAuthUser} from "../Session";
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
import Autocomplete from "@material-ui/core/Autocomplete";

import * as ROUTES from "../../constants/routes";
import {CLUB_IMG_PATH, FIREBASE_CLUBS_PATH} from "../../constants/sysUrls";
import * as MyUtils from "../../common/myUtils";
import withFormHOC from "../HookForm/withFormHOC";

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 750,
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

class ClubAddPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            imgLoading: false,
            submitLoading: false,
            submitSuccess: false,
            dialogOpen: false,
            dialogMsg: null,
            userList: [],
        };
    }

    componentDidMount() {
        const {authUser, firebase} = this.props;
        firebase.users(authUser.uid).then((value) => {
            this.setState({userList: value});
        });
    }

    componentWillUnmount() {
        const {firebase} = this.props;
        firebase.offUsers();
    }

    // submit form
    onSubmit(data) {
        const {authUser, firebase} = this.props;
        MyUtils.setAuthInfo(data, authUser);
        // set members array to key obj
        let members = data.members;
        data.members = MyUtils.arrayToKeyObj(members, (data, keyObj) => {
            keyObj[data.uid] = true;
        });
        this.setState({submitLoading: true});
        firebase.insert(data, FIREBASE_CLUBS_PATH, true).then(() => {
            this.setState({
                submitLoading: true,
                submitSuccess: true,
                dialogOpen: true,
                dialogMsg: "Awesome! Your club has been created."
            });
        }).catch((value) => {
            this.setState({submitLoading: false});
            alert(value);
        });
    };

    // upload img event
    onFileChange(e) {
        const {authUser, firebase} = this.props;
        const {setValue} = this.props.form;
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const filePath = CLUB_IMG_PATH + MyUtils.genFileId(file.name);

        this.setState({imgLoading: true});
        firebase.uploadFile(file, filePath).then((value) => {
            firebase.getDownloadURL(value.ref).then((value) => {
                this.setState({
                    imgLoading: false,
                });
                setValue("logo_url", value);
            }).catch(function onRejected(error){
                this.uploadFailedHandle(error);
            });
        }).catch(function onRejected(error){
            this.uploadFailedHandle(error);
        });
    };

    // handle error dialog close
    handleDialogClose() {
        this.setState({dialogOpen: false});
        if (this.state.submitSuccess) {
            this.props.history.push(ROUTES.LANDING);
        }
    };

    // upload failed handle
    uploadFailedHandle(msg) {
        this.setState({
            imgLoading: false,
            dialogOpen: true,
            dialogMsg: msg,
        });
    };

    render() {
        const {dialogOpen, dialogMsg, imgLoading, submitLoading, userList} = this.state;
        const {handleSubmit, control} = this.props.form;
        return (
            <Box m={4}>
                <Grid container spacing={2} sx={{display: 'flex',
                    justifyContent: 'center',}}>
                    <Item>
                        <form style={{width: "85%"}} onSubmit={handleSubmit((data) => {this.onSubmit(data)})}>
                            <h3 style={{textAlign: "left"}}>Create a new club!</h3>
                            <SubItem>
                                <Controller
                                    name="logo_url"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: {value }}) => (
                                        <Avatar
                                            value={value}
                                            src={value}
                                            sx={{ width: 150, height: 150, border: 'solid #c4c4c4 1px'}}
                                        />
                                    )}
                                />
                            </SubItem>
                            <SubItem>
                                <label htmlFor="icon-button-file">
                                    <FileInput accept="image/*" id="icon-button-file" type="file" onChange={(e) => {this.onFileChange(e)}} />
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
                            <Controller
                                name="club_name"
                                control={control}
                                defaultValue=""
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <TextField
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
                                defaultValue=""
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <TextField
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

                            <Controller
                                name="members"
                                control={control}
                                defaultValue=""
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <Autocomplete
                                        multiple
                                        sx={inputStyle}
                                        id="tags-outlined"
                                        options={userList}
                                        onChange={(_, data) => onChange(data)}
                                        getOptionLabel={(option) => option.email}
                                        filterSelectedOptions
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                label="Add members"
                                            />
                                        )}
                                    />
                                )}
                            />

                            <Button
                                sx={{
                                    marginTop: "20px",
                                    backgroundColor: "rgb(2,114,50)"
                                }}
                                type="submit"
                                variant="contained"
                                disabled={submitLoading}
                            >
                                Create Group
                            </Button>
                        </form>
                    </Item>
                </Grid>

                <Dialog
                    open={dialogOpen}
                    onClose={() => this.handleDialogClose()}
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
                        <Button onClick={() => this.handleDialogClose()}>Okay</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}
const condition = authUser => !!authUser;
export default compose(withFormHOC, withFirebase, withAuthUser, withAuthorization(condition))(ClubAddPage);