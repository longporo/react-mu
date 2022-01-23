import React from "react";
import {compose} from "recompose";
import {withFirebase} from "../Firebase";
import {withAuthorization, withAuthUser} from "../Session";
import Box from "@material-ui/core/Box";
import {styled} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from "@material-ui/core/CardActionArea";
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import Avatar from "@material-ui/core/Avatar";
import Switch from "@material-ui/core/Switch";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import blue from "@material-ui/core/colors/blue";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import BlockIcon from '@material-ui/icons/Block';
import Slide from "@material-ui/core/Slide/Slide";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";

import {onValue} from 'firebase/database';

import ItemAddPage from '../ItemAdd';
import ItemViewPage from '../ItemView';
import ClubViewPage from '../ClubView';
import * as MyUtils from "../../common/myUtils";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import ListItemButton from "@material-ui/core/ListItemButton";

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'unset',
    minHeight: 600,
    maxHeight: 600,
    overflow: 'auto',
    color: theme.palette.text.secondary,
}));

const SubItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    margin: 10,
    display: "inline-block",
    width: 220,
    color: theme.palette.text.secondary,
}));

const LeftItem = styled(Grid)(({theme}) => ({
    ...theme.typography.body2,
    display: 'flex',
    justifyContent: 'center',
    margin: 20,
    color: theme.palette.text.secondary,
}));

const CardItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: 'left',
    color: theme.palette.text.secondary,
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 22,
    height: 22,
    backgroundColor: `${theme.palette.background.paper}`,
    color: blue[600],
    border: `1px solid ${theme.palette.background.paper}`,
}));

class ClubDetailPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            club: {},
            owner: {},
            items: [],
            membersOpen: false,
            dialogOpen: false,
            members: [],
            handleMember: {},
            viewClubOpen: false,
            addItemOpen: false,
            viewItemOpen: false,
            clubMembersIdList: [],
            memberIdList: [],
            joinMembers: [],
            addMembersDialogOpen: false,
        };
    }

    componentDidMount() {
        const {authUser, firebase} = this.props;
        // get club info
        let clubId = this.props.location.state.clubId;
        onValue(firebase.getClubById(clubId), (snapshot) => {
            const result = snapshot.val();
            result["id"] = clubId;
            this.setState({
                club: result,
            });
            // get members
            if (result.members) {
                let memberIdList = Object.keys(result.members);
                let members = [];
                this.setState({clubMembersIdList: memberIdList});
                this.getUserByIdList(memberIdList, members, firebase);
            }

            // get owner info
            firebase.getUserById(result.create_id).then((value) => {
                this.setState({
                    owner: value,
                });
            });
        });

        // get items by club id
        onValue(firebase.getItemsByClubId(clubId), (snapshot) => {
            const result = snapshot.val();
            let dataList = MyUtils.keyObjToArray(result);
            this.setState({
                items: dataList,
            });
        });
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        let clubId = this.props.location.state.clubId;
        firebase.offGetClubById(clubId);
        firebase.offGetItemsByClubId();
    }

    /**
     * Get user by id list
     * @param memberIdList
     * @param members
     * @param firebase
     */
    getUserByIdList(memberIdList, members, firebase) {
        firebase.getUserById(memberIdList[members.length]).then((value) => {
            const {club} = this.state;
            let isAdmin = false;
            if (club.admins && club.admins[value.uid]) {
                isAdmin = true;
            }
            value.isAdmin = isAdmin;
            members.push(value);
            if (members.length == memberIdList.length) {
                this.setState({members: members});
                return;
            }
            this.getUserByIdList(memberIdList, members, firebase);
        })
    }

    /**
     * Handle members dialog closing
     */
    handleMembersClose() {
        this.setState({membersOpen: false});
    }

    /**
     * Handle add item closing
     */
    handleAddItemClose() {
        this.setState({addItemOpen: false});
    }

    /**
     * Handle view club opening
     */
    handleViewClubOpen() {
        this.setState({
            viewClubOpen: true,
        });
    }

    /**
     * Handle view club closing
     */
    handleViewClubClose() {
        this.setState({viewClubOpen: false});
    }

    /**
     * Handle view item opening
     */
    handleViewItemOpen(itemId) {
        this.setState({
            currItemId: itemId,
            viewItemOpen: true,
        });
    }

    /**
     * Handle view item closing
     */
    handleViewItemClose() {
        this.setState({viewItemOpen: false});
    }

    /**
     * handle borrowing item
     */
    handleBorrowItem(even, id) {
        const {authUser, firebase} = this.props;
        firebase.borrowItemByUid(id, authUser.uid);
    }

    /**
     * handle returning item
     */
    handleReturnItem(even, id) {
        const {firebase} = this.props;
        firebase.returnItemById(id);
    }

    /**
     * toggle club admin role
     */
    toggleClubAdminRole(memberId, role) {
        const {club} = this.state;
        const {firebase} = this.props;
        firebase.toggleClubAdminRole(club.id, memberId, role);
    }

    /**
     * delete member
     */
    handleMemberDelClick(member) {
        this.setState({
            handleMember: member,
            dialogOpen: true,
        });
    }

    /**
     * Handle dialog closing
     */
    handleDialogClose() {
        this.setState({dialogOpen: false});
    }

    /**
     * Handle dialog click okay
     */
    handleDialogOkay() {
        const {club, handleMember} = this.state;
        const {firebase} = this.props;
        firebase.exitClub(club.id, handleMember.uid).then(() => {
            // just update locally, no time to real-time update. (ಡωಡ)hiahiahia
            let updateMembers = this.state.members.filter(firebase.filterUid(handleMember.uid));
            this.setState({members: updateMembers});
            this.handleDialogClose();
        })
    }

    /**
     * Sort member list by admin role
     */
    sortMembersByAdminRole() {
        return (a, b) => {
            return (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0);
        }
    }

    AddMembersOpen () {
        this.setState({
            addMembersDialogOpen: true,
            memberIdList: [],
        });
        const {authUser, firebase} = this.props;
        // get members to join
        firebase.users(authUser.uid).then((value) => {
            this.setState({joinMembers: value})
        });
    }

    addMembersClose () {
        this.setState({
            addMembersDialogOpen: false,
        });
    }

    saveSelectedMembers () {
        this.setState({
            addMembersDialogOpen: false,
        });

        const {memberIdList} = this.state;
        if (memberIdList.length === 0) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.joinClubsByIds(0);
    }

    joinClubsByIds (index) {
        const {authUser, firebase} = this.props;
        const {memberIdList, club} = this.state;

        if (index >= memberIdList.length) {
            return;
        }
        if (index === memberIdList.length - 1) {
            firebase.joinClubByUid(club.id, memberIdList[index]).then(() => {
            });
            return;
        }
        firebase.joinClubByUid(club.id, memberIdList[index]).then(() => {
            this.joinClubsByIds((index + 1));
        });
    }

    handleJoinClubSelect (value) {
        const {memberIdList} = this.state;
        const currentIndex = memberIdList.indexOf(value);
        const newChecked = [...memberIdList];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({memberIdList: newChecked});
    };

    filterClubMembers (obj) {
        return this.state.clubMembersIdList.indexOf(obj.uid) == -1;
    };

    render() {
        const {authUser} = this.props;
        const {club, owner, items, membersOpen, members, handleMember, dialogOpen, memberIdList, joinMembers} = this.state;
        let myJoinMembers = joinMembers.filter((obj) => this.filterClubMembers(obj));
        return (
            <Box mt={2} ml={4} mr={4}>
                <Grid container spacing={2}>
                    <Grid container item xs={2} sx={{display: 'flex', justifyContent: 'center', height: 250}}>
                        <LeftItem>
                            <CardActionArea onClick={() => {this.handleViewClubOpen()}}>
                                <Avatar
                                    src={club.logo_url}
                                    sx={{width: 150, height: 150, border: 'solid #c4c4c4 1px'}}
                                />
                            </CardActionArea>
                        </LeftItem>
                        <LeftItem sx={{ margin: 0}}>
                            <Typography gutterBottom variant="h5" component="div" sx={{textAlign: "center", minWidth: 150}}>
                                {club.club_name}
                            </Typography>
                        </LeftItem>
                        <LeftItem>
                            <Button
                                sx={{backgroundColor: "rgb(2,114,50)"}}
                                type="button"
                                variant="contained"
                                onClick={() => {
                                    this.setState({membersOpen: true})
                                }}
                            >
                                Members
                            </Button>
                        </LeftItem>
                        {(club.create_id === authUser.uid || (club.admins && club.admins[authUser.uid])) && (
                            <>
                                <LeftItem>
                                    <Button
                                        sx={{backgroundColor: "rgb(2,114,50)"}}
                                        type="button"
                                        variant="contained"
                                        onClick={() => {this.AddMembersOpen()}}
                                    >
                                        Add members
                                    </Button>
                                </LeftItem>
                                <LeftItem>
                                    <Button
                                        sx={{backgroundColor: "rgb(2,114,50)"}}
                                        type="button"
                                        variant="contained"
                                        onClick={() => {
                                            this.setState({addItemOpen: true})
                                        }}
                                    >
                                        Add new item
                                    </Button>
                                </LeftItem>
                            </>
                        )}
                        <LeftItem>
                            <CardItem>
                                <CardContent sx={{padding: 0, paddingLeft: "8px"}}>
                                    Owner:
                                </CardContent>
                                <CardHeader
                                    sx={{padding: '4px'}}
                                    avatar={
                                        <Avatar sx={{bgcolor: blue[500], marginRight: "-10px"}} aria-label="recipe">
                                            <PersonIcon/>
                                        </Avatar>
                                    }
                                    title={owner.email}
                                />
                            </CardItem>
                        </LeftItem>
                    </Grid>
                    <Grid container item xs={10}>
                        <Item>
                            {
                                items.map((item) => (
                                    <SubItem key={item.id}>
                                        <CardActionArea onClick={() => {this.handleViewItemOpen(item.id)}}>
                                            <CardMedia
                                                component="img"
                                                alt="green iguana"
                                                height="180"
                                                image={item.imgList[0]}
                                            />
                                        </CardActionArea>
                                        <Typography gutterBottom variant="h6" component="div"
                                                    sx={{color: "#e57373", marginBottom: "0px", borderTop: 'solid #c4c4c4 1px'}}>
                                            {item.item_name}
                                        </Typography>
                                        <CardActions sx={{paddingTop: "0px"}}>
                                            <ListItem sx={{
                                                paddingLeft: "0px !important",
                                                paddingRight: "0px !important"
                                            }}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={club.logo_url}
                                                    />
                                                </ListItemAvatar>
                                                {(!item.borrow_uid) && (
                                                    <div style={{display: "contents"}}>
                                                        <ListItemText primary={"Borrow"}
                                                                      style={{textAlign: 'center'}}/>
                                                        <Switch
                                                            inputProps={{'aria-label': 'controlled'}}
                                                            onChange={(e) => this.handleBorrowItem(e, item.id)}
                                                        />
                                                    </div>
                                                )}
                                                {(item.borrow_uid && item.borrow_uid===authUser.uid) && (
                                                    <div style={{display: "contents"}}>
                                                        <ListItemText primary={"Borrowing"}
                                                                      style={{textAlign: 'center'}}/>
                                                        <Switch
                                                            inputProps={{'aria-label': 'controlled'}}
                                                            defaultChecked
                                                            onChange={(e) => this.handleReturnItem(e, item.id)}
                                                        />
                                                    </div>
                                                )}
                                                {(item.borrow_uid && item.borrow_uid !== authUser.uid) && (
                                                    <div style={{display: "contents"}}>
                                                        <ListItemText primary={"Unavailable"}
                                                                      style={{textAlign: 'center'}}/>
                                                        <BlockIcon/>
                                                    </div>
                                                )}
                                            </ListItem>
                                        </CardActions>
                                    </SubItem>
                                ))
                            }
                            {items.length == 0 && (
                                <h3>Oooops! No items yet...</h3>
                            )}
                        </Item>
                    </Grid>
                </Grid>

                {/* members dialog*/}
                <Dialog onClose={() => {
                    this.handleMembersClose()
                }} open={membersOpen}>
                    <DialogTitle>Members</DialogTitle>
                    <List sx={{
                        pt: 0,
                        maxHeight: 350,
                        overflow: 'auto',
                    }}
                          subheader={
                              <ListSubheader style={{textAlign: 'left', fontWeight: 'bold', zIndex: 999}}>
                                  Total: {members.length}
                              </ListSubheader>
                          }
                    >
                        {members.sort(this.sortMembersByAdminRole()).map((item, index) => (
                            <ListItem
                                key={index}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent=
                                            {item.isAdmin ? (
                                                <SmallAvatar alt="The admin role">
                                                    <VerifiedUserIcon/>
                                                </SmallAvatar>
                                            ): null}

                                    >
                                        <Avatar sx={{bgcolor: blue[100], color: blue[600]}}>
                                            <PersonIcon/>
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText primary={item.email}/>
                                {club.create_id === authUser.uid && (
                                        <>
                                            {item.isAdmin && (
                                                <Tooltip title="Unassign admin role">
                                                    <IconButton onClick={() => this.toggleClubAdminRole(item.uid, null)}
                                                                edge="end" aria-label="comments">
                                                        <VerifiedUserIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {!item.isAdmin && (
                                                <Tooltip title="Assign admin role">
                                                    <IconButton onClick={() => this.toggleClubAdminRole(item.uid, true)}
                                                                edge="end" aria-label="comments">
                                                        <VerifiedUserOutlinedIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete member">
                                                <IconButton sx={{ml: 1}} onClick={() => this.handleMemberDelClick(item)}
                                                            edge="end" aria-label="comments">
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Dialog>

                {/* add item dialog*/}
                <Dialog
                    fullScreen
                    open={this.state.addItemOpen}
                    onClose={() => {
                        this.handleAddItemClose()
                    }}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{position: 'relative'}}>
                        <Toolbar sx={{backgroundColor: "rgb(2,114,50)"}}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => this.handleAddItemClose()}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                            <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                                Add item to your Inventory!
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <ItemAddPage clubId={this.props.location.state.clubId} authUser={this.props.authUser}
                                 firebase={this.props.firebase}
                                 onClose={() => this.handleAddItemClose()}/>
                </Dialog>

                {/* view club dialog*/}
                <Dialog
                    fullScreen
                    open={this.state.viewClubOpen}
                    onClose={() => {
                        this.handleViewClubClose()
                    }}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{position: 'relative'}}>
                        <Toolbar sx={{backgroundColor: "rgb(2,114,50)"}}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => this.handleViewClubClose()}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                            <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                                Club view
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <ClubViewPage club={this.state.club} authUser={this.props.authUser}
                                  firebase={this.props.firebase}
                                  onClose={() => this.handleViewClubClose()}/>
                </Dialog>

                {/* view item dialog*/}
                <Dialog
                    fullScreen
                    open={this.state.viewItemOpen}
                    onClose={() => {
                        this.handleViewItemClose()
                    }}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{position: 'relative'}}>
                        <Toolbar sx={{backgroundColor: "rgb(2,114,50)"}}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => this.handleViewItemClose()}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                            <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                                Item view
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <ItemViewPage itemId={this.state.currItemId} authUser={this.props.authUser}
                                 firebase={this.props.firebase}
                                 onClose={() => this.handleViewItemClose()}/>
                </Dialog>

                {/* member delete warning dialog*/}
                <Dialog
                    open={dialogOpen}
                    onClose={() => {this.handleDialogClose()}}
                    maxWidth={"xs"}
                    fullWidth={true}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Warning"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to remove <b>{handleMember.email}</b> from <b>{club.club_name}</b>?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {this.handleDialogOkay()}}>Okay</Button>
                        <Button onClick={() => {this.handleDialogClose()}}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                {/* add new members dialog*/}
                <Dialog
                    fullScreen
                    open={this.state.addMembersDialogOpen}
                    onClose={() => { this.addMembersClose()}}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar sx={{backgroundColor: "rgb(2,114,50)"}}>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={() => {this.addMembersClose()}}
                                    aria-label="close"
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </Box>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                    Add members
                                </Typography>
                            </Box>
                            <Box sx={{flexGrow: 1}}/>
                            <Button autoFocus color="inherit" onClick={() => this.saveSelectedMembers()}>
                                Save
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <List
                        sx={{
                            width: '40%',
                            marginLeft: '30%',
                        }}
                        subheader={<ListSubheader style={{textAlign: 'left'}}>
                            <h4>Total: {myJoinMembers.length}</h4></ListSubheader>}
                    >
                        {myJoinMembers.map((item, index) => {
                            const id = item.uid;
                            const labelId = 'checkbox-list-secondary-label-' + id;
                            return (
                                <div key={id}>
                                    <Divider />
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <Checkbox
                                                edge="end"
                                                onChange={() => this.handleJoinClubSelect(id)}
                                                checked={memberIdList.indexOf(id) !== -1}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        }>
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={""}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={item.email}
                                                onClick={() => this.handleJoinClubSelect(id)}
                                                style={{textAlign: 'center'}}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider />
                                </div>
                            );
                        })}
                        {myJoinMembers.length === 0 && (
                            <h4>Oooops! No members yet...</h4>
                        )}
                    </List>
                </Dialog>
            </Box>
        )
    }
}

const condition = authUser => !!authUser;
export default compose(withFirebase, withAuthUser, withAuthorization(condition))(ClubDetailPage);