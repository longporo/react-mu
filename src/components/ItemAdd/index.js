import React from "react";
import {Controller} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {compose} from "recompose";
import Box from "@material-ui/core/Box";
import {styled} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import green from "@material-ui/core/colors/green";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import {ITEM_IMG_PATH, FIREBASE_ITEMS_PATH} from "../../constants/sysUrls";
import ImageList from "@material-ui/core/ImageList";
import ImageListItem from "@material-ui/core/ImageListItem";
import Alert from "@material-ui/core/Alert";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from '@material-ui/icons/Cancel';
import ImageListItemBar from "@material-ui/core/ImageListItemBar/ImageListItemBar";

import * as MyUtils from "../../common/myUtils";
import withFormHOC from "../HookForm/withFormHOC";

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 600,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const SubItem = styled(Grid)(({theme}) => ({
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

const imgRef = React.createRef();

class ItemAddPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgLoading: false,
            submitLoading: false,
            dialogOpen: false,
            dialogMsg: null,
            imgList: [],
            imgUploadWarnOpen: false,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    /**
     * Handle dialog closing
     */
    handleDialogClose() {
        this.setState({dialogOpen: false});
    }

    // submit form
    onSubmit(data) {
        if (this.state.imgList.length == 0) {
            this.setState({imgUploadWarnOpen: true});
            return;
        }
        const {authUser, firebase, clubId} = this.props;
        const {imgList} = this.state;
        data.club_id = clubId;
        MyUtils.setAuthInfo(data, authUser);
        data.imgList = imgList;
        this.setState({submitLoading: true});
        firebase.insert(data, FIREBASE_ITEMS_PATH, true).then(() => {
            this.setState({
                submitLoading: true,
                submitSuccess: true,
                dialogOpen: true,
                dialogMsg: "Awesome! Your item has been created."
            });
        }).catch((value) => {
            this.setState({submitLoading: false});
            alert(value);
        });
    };

    // upload img event
    onFileChange(e) {
        const {firebase} = this.props;
        const file = e.target.files[0];
        // clear file input state
        imgRef.current.value = "";
        if (!file) {
            return;
        }
        if (this.state.imgList.length > 2) {
            this.setState({
                dialogOpen: true,
                dialogMsg: "You can only upload up to 3 photos."
            });
            return;
        }

        const filePath = ITEM_IMG_PATH + MyUtils.genFileId(file.name);

        this.setState({imgLoading: true});
        firebase.uploadFile(file, filePath).then((value) => {
            firebase.getDownloadURL(value.ref).then((value) => {
                let imgList = this.state.imgList;
                imgList.push(value);
                this.setState({
                    imgLoading: false,
                    imgList: imgList,
                });
                this.setState({imgUploadWarnOpen: false});
            }).catch(function onRejected(error) {
                this.uploadFailedHandle(error);
            });
        }).catch(function onRejected(error) {
            this.uploadFailedHandle(error);
        });
    };

    // handle error dialog close
    handleDialogClose() {
        this.setState({dialogOpen: false});
        if (this.state.submitSuccess) {
            this.props.onClose();
        }
    };

    // upload failed handle
    uploadFailedHandle (msg) {
        this.setState({
            imgLoading: false,
            dialogOpen: true,
            dialogMsg: msg,
        });
    };

    /**
     * Item picture delete
     * @param imgUrl
     */
    handlePicDelClick(imgUrl) {
        let imgList = this.state.imgList;
        imgList.splice(imgList.indexOf(imgUrl), 1);
        this.setState({
            imgList: imgList,
        });
    }

    render() {
        const {imgList, dialogOpen, dialogMsg, imgLoading, submitLoading, imgUploadWarnOpen} = this.state;
        const {handleSubmit, control, setValue} = this.props.form;
        return (
            <Box m={4}>
                <Grid container spacing={2} sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Item>
                        <form style={{width: "90%"}} onSubmit={handleSubmit((data) => {this.onSubmit(data)})}>
                            <Collapse in={imgUploadWarnOpen}>
                                <Alert variant="outlined" severity="warning">
                                    Please upload item photos!
                                </Alert>
                            </Collapse>
                            <SubItem>
                                {imgList.length > 0 && (
                                    <ImageList cols={imgList.length} rowHeight={165}>
                                        {imgList.map((item, index) => (
                                            <ImageListItem key={index}>
                                                <img
                                                    src={item}
                                                    style={{width: '165px', height: '165px', }}
                                                    alt={"item image"}
                                                    loading="lazy"
                                                />
                                                <ImageListItemBar
                                                    sx={{
                                                        background:
                                                            'linear-gradient(to right, rgba(0,0,0,0.1) 0%, ' +
                                                            'rgba(0,0,0,0.2) 100%, rgba(0,0,0,0) 100%)',
                                                    }}
                                                    title={""}
                                                    position="top"
                                                    actionIcon={
                                                        <IconButton
                                                            onClick={() => this.handlePicDelClick(item)}
                                                            sx={{ color: 'white', padding: 0}}
                                                            aria-label={'Delete picture'}
                                                        >
                                                            <CancelIcon fontSize="small"/>
                                                        </IconButton>
                                                    }
                                                    actionPosition="right"
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                )}
                                {imgList.length == 0 && (
                                    <div>
                                        <h3 style={{lineHeight: '160px'}}>Upload photos, show us what your item looks like!</h3>
                                    </div>
                                )}
                            </SubItem>
                            <SubItem>
                                <label htmlFor="icon-button-file">
                                    <FileInput accept="image/*" id="icon-button-file" type="file" ref={imgRef} onChange={(e) => {this.onFileChange(e)}}/>
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
                                name="item_name"
                                control={control}
                                defaultValue=""
                                render={({field: {onChange, value}, fieldState: {error}}) => (
                                    <TextField
                                        sx={inputStyle}
                                        label="Item name"
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
                                        value: 20,
                                        message: 'Entry cannot exceed 20 characters',
                                    },
                                }}
                            />

                            <Controller
                                name="desc"
                                control={control}
                                defaultValue=""
                                render={({field: {onChange, value}, fieldState: {error}}) => (
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


                            <Button
                                sx={{
                                    marginTop: "20px",
                                    backgroundColor: "rgb(2,114,50)"
                                }}
                                type="submit"
                                variant="contained"
                                disabled={submitLoading}
                            >
                                Add Item!
                            </Button>
                        </form>
                    </Item>
                </Grid>

                <Dialog
                    open={dialogOpen}
                    onClose={() => {this.handleDialogClose()}}
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
                        <Button onClick={() => {this.handleDialogClose()}}>Okay</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

export default compose(withFormHOC)(ItemAddPage);