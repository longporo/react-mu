import React from "react";
import {Controller} from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import PersonIcon from '@material-ui/icons/Person';
import {compose} from "recompose";
import Box from "@material-ui/core/Box";
import CancelIcon from '@material-ui/icons/Cancel';
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
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Avatar from "@material-ui/core/Avatar";
import blue from "@material-ui/core/colors/blue";
import Alert from "@material-ui/core/Alert";
import Collapse from "@material-ui/core/Collapse";

import * as MyUtils from "../../common/myUtils";
import withFormHOC from "../HookForm/withFormHOC";
import IconButton from "@material-ui/core/IconButton";
import ImageListItemBar from "@material-ui/core/ImageListItemBar";

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 680,
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

const CardItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: 'left',
    color: theme.palette.text.secondary,
}));

const FileInput = styled('input')({
    display: 'none',
});

const imgRef = React.createRef();

class ItemViewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgLoading: false,
            creator: {},
            club: {},
            borrower: null,
            submitLoading: false,
            dialogOpen: false,
            dialogMsg: null,
            imgList: [],
            imgUploadWarnOpen: false,
            delItemDialogOpen: false,
        };
    }

    componentDidMount() {
        const {firebase, itemId} = this.props;
        // get item by id
        firebase.getItemById(itemId).then((item) => {
            this.setState({item: item});
            // get club
            firebase.getClubByIdPromise(item.club_id).then((club) => {
                this.setState({club: club});
            });
            // get creator
            firebase.getUserById(item.create_id).then((creator) => {
                this.setState({creator: creator});
            });
            // get borrower
            let borrowUid = item.borrow_uid;
            if (borrowUid) {
                firebase.getUserById(borrowUid).then((borrower) => {
                    this.setState({borrower: borrower});
                });
            }
        });
    }

    componentWillUnmount() {
        const {firebase, itemId} = this.props;
        firebase.OffGetItemById(itemId);
    }

    /**
     * Handle dialog closing
     */
    handleDialogClose() {
        this.setState({dialogOpen: false});
    }

    

    /**
     * Delete the created Item
     */

     
    delItemYesClose () {
        //debugger;
        this.setState({
            delItemDialogOpen: false,
        });

        const {firebase, itemId} = this.props;
        firebase.delItem(itemId).then(() => {
            this.props.onClose();
        });
    }

     handleItemDelClick() {
        this.setState({
            delItemDialogOpen: true,
        })
    }

    delItemCancelClose () {
        this.setState({
            delItemDialogOpen: false,
        });
    }
    // submit form
    onSubmit(data) {
        const {firebase} = this.props;
        let updateData = this.state.item;
        if (updateData.imgList.length == 0) {
            this.setState({imgUploadWarnOpen: true});
            return;
        }

        this.setState({submitLoading: true});
        // merge form data to updateData
        Object.assign(updateData, data);
        firebase.updateItem(updateData).then(() => {
            this.setState({
                submitLoading: true,
                submitSuccess: true,
                dialogOpen: true,
                dialogMsg: "Item has been updated!"
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
        if (this.state.item.imgList.length > 2) {
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
                let imgList = this.state.item.imgList;
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
        let imgList = this.state.item.imgList;
        imgList.splice(imgList.indexOf(imgUrl), 1);
        this.setState({imgList: imgList});
    }

    render() {
        const {item, creator, borrower, dialogOpen, dialogMsg, imgLoading, submitLoading, imgUploadWarnOpen, club} = this.state;
        const {authUser} = this.props;
        const {handleSubmit, control, setValue} = this.props.form;
        return (
            <Box m={4}>
                <Grid container spacing={2} sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Item>
                        {item && (
                            <form style={{width: "90%"}} onSubmit={handleSubmit((data) => {this.onSubmit(data)})}>
                                <Collapse in={imgUploadWarnOpen}>
                                    <Alert variant="outlined" severity="warning">
                                        Please upload item photos!
                                    </Alert>
                                </Collapse>
                                <SubItem>
                                    {item.imgList.length > 0 && (
                                        <ImageList cols={item.imgList.length} rowHeight={165}>
                                            {item.imgList.map((imgUrl) => (
                                                <ImageListItem key={imgUrl}>
                                                    <img
                                                        src={imgUrl}
                                                        style={{width: '165px', height: '165px', }}
                                                        alt={"item image"}
                                                    />
                                                    {authUser.uid === item.create_id && (
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
                                                                    onClick={() => this.handlePicDelClick(imgUrl)}
                                                                    sx={{ color: 'white', padding: 0}}
                                                                    aria-label={'Delete picture'}
                                                                >
                                                                    <CancelIcon fontSize="small"/>
                                                                </IconButton>
                                                            }
                                                            actionPosition="right"
                                                        />
                                                    )}
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    )}
                                    {item.imgList.length == 0 && (
                                        <div>
                                            <h3 style={{lineHeight: '160px'}}>Upload photos, show us what your item looks like!</h3>
                                        </div>
                                    )}
                                </SubItem>
                                {authUser.uid === item.create_id && (
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
                                )}
                                <Controller
                                    name="item_name"
                                    control={control}
                                    defaultValue={item.item_name}
                                    render={({field: {onChange, value}, fieldState: {error}}) => (
                                        <TextField
                                            disabled={authUser.uid !== item.create_id}
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
                                    defaultValue={item.desc}
                                    render={({field: {onChange, value}, fieldState: {error}}) => (
                                        <TextField
                                            disabled={authUser.uid !== item.create_id}
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
                                <SubItem sx={{marginTop: '10px', marginBottom: '10px', marginLeft: 0, marginRight: 0}}>
                                    <CardItem sx={{marginRight: '8px', width: "50%"}}>
                                        <CardContent sx={{padding: 0, paddingLeft: "8px"}}>
                                            Creator:
                                        </CardContent>
                                        <CardHeader
                                            sx={{padding: '8px'}}
                                            avatar={
                                                <Avatar sx={{bgcolor: blue[500]}} aria-label="recipe">
                                                    <PersonIcon/>
                                                </Avatar>
                                            }
                                            title={creator.email}
                                        />
                                    </CardItem>
                                    <CardItem sx={{marginLeft: '8px', width: "50%"}}>
                                        <CardContent sx={{padding: 0, paddingLeft: "8px"}}>
                                            Borrower:
                                        </CardContent>
                                        {borrower && (
                                            <CardHeader
                                                sx={{padding: '8px'}}
                                                avatar={
                                                    <Avatar sx={{bgcolor: blue[500]}} aria-label="recipe">
                                                        <PersonIcon/>
                                                    </Avatar>
                                                }
                                                title={borrower.email}
                                            />
                                            )}
                                        {!borrower && (
                                            <CardHeader
                                                sx={{textAlign: 'center', padding: '8px', color: 'rgb(129, 215, 95)'}}
                                                title={"AVAILABLE"}
                                            />
                                        )}
                                    </CardItem>
                                </SubItem>
                                {authUser.uid === item.create_id && (
                                        <Button
                                            sx={{
                                                marginTop: "10px",
                                                backgroundColor: "rgb(2,114,50)"
                                            }}
                                            type="submit"
                                            variant="contained"
                                            disabled={submitLoading}
                                        >
                                            Update Item
                                        </Button>
                                    )}

                                {/* the item creator and the club owner can delete the item */}
                                {(authUser.uid === item.create_id || authUser.uid === club.create_id) && (
                                        <Button onClick={() => this.handleItemDelClick()}
                                            sx={{
                                                marginTop: "10px",
                                                marginLeft: "10px",
                                                backgroundColor: "rgb(2,114,50)"
                                            }}
                                            //type="delete"
                                            variant="contained"
                                            disabled={submitLoading}
                                        >
                                            Delete Item
                                        </Button>
                                    )}
                            </form>
                        )}
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

                {/*Delete item */}
                <div key={"deleteItem"}>
                    <Dialog
                        open={this.state.delItemDialogOpen}
                        maxWidth={"xs"}
                        fullWidth={true}
                        onClose={() => {this.delItemCancelClose()}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Warning"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {"Are you sure you want to delete this item?"}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.delItemCancelClose()}>No</Button>
                            <Button onClick={() => this.delItemYesClose()} autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </Box>
        );
    }
}

export default compose(withFormHOC)(ItemViewPage);