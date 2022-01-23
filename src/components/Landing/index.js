import * as React from 'react';
import {styled, alpha} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import ListItem from '@material-ui/core/ListItem';
import ListItemButton from '@material-ui/core/ListItemButton';
import ListItemText from '@material-ui/core/ListItemText';
import {Link} from "react-router-dom";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AddIcon from '@material-ui/icons/Add';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import CardHeader from "@material-ui/core/CardHeader";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import orange from "@material-ui/core/colors/orange";

import * as ROUTES from "../../constants/routes";
import {withFirebase} from '../Firebase';
import {compose} from "recompose";
import {withAuthorization, withAuthUser} from "../Session";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";

//search bar
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: 'unset',
    boxShadow: 'unset',
    color: theme.palette.text.secondary,
}));

const SubItem = styled(Grid)(({theme}) => ({
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
    width: '60%',
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// this is the search bar
const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '40ch',
        },
    },
}));

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

class LandingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            exitClubDialogOpen: false,
            delClubDialogOpen: false,
            joinClubDialogOpen: false,
            handleClubId: null,
            search:null, // search 1
            joinClubs: [],
            clubIdList: [],
            clubs: [],
        };
    }

    searchSpace=(event)=>{ // search 2
        let keyword = event.target.value;
        this.setState({search: keyword})
    }

    

    componentDidMount() {
        // render user's own clubs or joined clubs
        this.renderClubsByUid();
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        firebase.offGetClubsByUid(authUser.uid);
    }

    /**
     * Delete the created club
     */
    handleClubDelClick(clubId) {
        this.setState({
            delClubDialogOpen: true,
            handleClubId: clubId,
        })
    }
    delClubCancelClose () {
        this.setState({
            delClubDialogOpen: false,
        });
    }
    delClubYesClose () {
        this.setState({
            delClubDialogOpen: false,
        });
        const {firebase} = this.props;
        firebase.delClub(this.state.handleClubId).then(() => { // pass club id
            this.renderClubsByUid();
        });
    }

    

    /**
     * Exit the joined club
     */
    handleClubExitClick (clubId) {
        this.setState({
            exitClubDialogOpen: true,
            handleClubId: clubId,
        })
    }
    exitClubCancelClose () {
        this.setState({
            exitClubDialogOpen: false,
        });
    }
    exitClubYesClose () {
        this.setState({
            exitClubDialogOpen: false,
        });
        const {authUser, firebase} = this.props;
        firebase.exitClub(this.state.handleClubId, authUser.uid).then(() => {
            this.renderClubsByUid();
        });
    }

    /**
     * Render clubs by uid
     */
    renderClubsByUid () { // refresh th page
        this.setState({loading: true});
        const {authUser, firebase} = this.props;
        firebase.getClubsByUid(authUser.uid).then((value) => {
            this.setState({clubs: value});
            this.setState({loading: false});
        });
    }

    joinClubOpen () {
        this.setState({
            joinClubDialogOpen: true,
            clubIdList: [],
            search: "",
        });
        const {authUser, firebase} = this.props;
        // get clubs to join
        firebase.getClubsToJoin(authUser.uid).then((value) => {
            this.setState({joinClubs: value})
        });
    }

    joinClubClose () {
        this.setState({
            joinClubDialogOpen: false,
        });
    }

    joinClubResetArray (searchTermArray) {
        return [];
    }

    saveSelectedClub () {
        this.setState({
            joinClubDialogOpen: false,
        });
        
        const {clubIdList} = this.state;
        if (clubIdList.length === 0) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.joinClubsByIds(0);
    }

    joinClubsByIds (index) {
        const {authUser, firebase} = this.props;
        const {clubIdList} = this.state;

        if (index >= clubIdList.length) {
            return;
        }
        if (index === clubIdList.length - 1) {
            firebase.joinClubByUid(clubIdList[index], authUser.uid).then(() => {
                this.renderClubsByUid();
            });
            return;
        }
        firebase.joinClubByUid(clubIdList[index], authUser.uid).then(() => {
            this.joinClubsByIds((index + 1));
        });
    }

    handleJoinClubSelect (value) {
        const {clubIdList} = this.state;
        const currentIndex = clubIdList.indexOf(value);
        const newChecked = [...clubIdList];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({clubIdList: newChecked});
    };

    checkSearch (searchTermArray) {
        for (var i = 0; i < searchTermArray.length; i++)
        {
            if(searchTermArray[i] == true)
            {
                return true;
            }
        }
        return false;
    };

    

    render() {
        const {loading, clubs, clubIdList, joinClubs} = this.state;
        const {authUser} = this.props;
        var searchTerm = true;
        var searchTermArray = [];

        



        // https://medium.com/crobyer/search-filter-with-react-js-88986c644ed5 
        // search reference

        
            

        return (
            <Box mt={2} ml={4} mr={4}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Item>
                            <div style={{height: 60}}>
                                <h1 style={{color: 'rgb(2,114,50)'}}>My Clubs</h1>
                            </div>
                            <Box
                                sx={{width: '100%', height: 500, bgcolor: 'unset'}}
                            >
                                {loading && (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: green[500],
                                            position: 'inherit',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '80px',
                                        }}
                                    />
                                )}

                                {!loading && (
                                    <List
                                        sx={{
                                            width: '60%',
                                            marginLeft: '20%',
                                            maxHeight: 480,
                                            bgcolor: 'unset',
                                            position: 'relative',
                                            overflow: 'auto',
                                            '& ul': {padding: 0},
                                        }}
                                    >
                                        {clubs.map((item, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    marginBottom: '10px',
                                                    border: 'solid #c4c4c4 1px',
                                                    height: '60px',
                                                    bgcolor: 'background.paper',
                                                    borderRadius: '10px'
                                                }}
                                                secondaryAction={
                                                    item.create_id === authUser.uid ?
                                                        <IconButton onClick={() => this.handleClubDelClick(item.id)}
                                                                    edge="end" aria-label="comments">
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                        :
                                                        <IconButton onClick={() => this.handleClubExitClick(item.id)}
                                                                    edge="end" aria-label="comments">
                                                            <ExitToAppIcon/>
                                                        </IconButton>
                                                }>
                                                <ListItemButton component={Link}
                                                                to={
                                                                    {
                                                                        pathname: ROUTES.CLUB_DETAIL,
                                                                        state: {clubId: item.id}
                                                                    }
                                                                }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={item.logo_url}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText primary={item.club_name}
                                                                  style={{textAlign: 'center'}}/>
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                        {clubs.length === 0 && (
                                            <h4>No clubs yet, join or create one!</h4>
                                        )}
                                    </List>
                                )}
                            </Box>
                        </Item>
                    </Grid>
                    <Grid item xs={6}>
                        <Item sx={{height: 580}}>
                            <SubItem>
                                <Avatar src={'src/img/logo/logo.png'}
                                        sx={{width: 150, height: 150}}/>
                            </SubItem>
                            <SubItem>
                                <CardItem>
                                    <CardActionArea to={ROUTES.MY_ITEMS} component={Link}>
                                        <CardHeader
                                            sx={{padding: '8px'}}
                                            avatar={
                                                <Avatar sx={{bgcolor: green[500]}} aria-label="recipe">
                                                    <ShoppingBasketIcon/>
                                                </Avatar>
                                            }
                                            title="My borrowed items"
                                        />
                                    </CardActionArea>
                                </CardItem>
                            </SubItem>
                            <SubItem>
                                <CardItem>
                                    <CardActionArea to={ROUTES.CLUB_ADD} component={Link}>
                                        <CardHeader
                                            sx={{padding: '8px'}}
                                            avatar={
                                                <Avatar sx={{bgcolor: orange[500]}} aria-label="recipe">
                                                    <AddIcon/>
                                                </Avatar>
                                            }
                                            title="Create new club"
                                        />
                                    </CardActionArea>
                                </CardItem>
                            </SubItem>
                            <SubItem>
                                <CardItem>
                                    <CardActionArea onClick={() => this.joinClubOpen()}>
                                        <CardHeader
                                            sx={{padding: '8px'}}
                                            avatar={
                                                <Avatar sx={{bgcolor: red[500]}} aria-label="recipe">
                                                    <GroupAddIcon/>
                                                </Avatar>
                                            }
                                            title="Join club"
                                        />
                                    </CardActionArea>
                                </CardItem>
                            </SubItem>
                        </Item>
                    </Grid>
                </Grid>

                <div key={"exitClub"}>
                    <Dialog
                        open={this.state.exitClubDialogOpen}
                        maxWidth={"xs"}
                        fullWidth={true}
                        onClose={() => {this.exitClubCancelClose()}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Warning"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {"Are you sure you want to quit the club?"}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.exitClubCancelClose()}>No</Button>
                            <Button onClick={() => this.exitClubYesClose()} autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                
                <div key={"deleteClub"}>
                    <Dialog
                        open={this.state.delClubDialogOpen}
                        maxWidth={"xs"}
                        fullWidth={true}
                        onClose={() => {this.delClubCancelClose()}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Warning"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {"Are you sure you want to delete this club?"}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.delClubCancelClose()}>No</Button>
                            <Button onClick={() => this.delClubYesClose()} autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>

                

                <div key={"joinClub"}>
                    <Dialog
                        fullScreen
                        open={this.state.joinClubDialogOpen}
                        onClose={() => { this.joinClubClose()}}
                        TransitionComponent={Transition}
                    >
                        <AppBar sx={{ position: 'relative' }}>
                            <Toolbar  sx={{backgroundColor: "rgb(2,114,50)"}}>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={() => {  this.joinClubClose(); }} //search 6
                                    aria-label="close"
                                >
                                <CloseIcon/>
                                </IconButton>
                            </Box>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                    Select clubs
                                </Typography>
                            </Box>
                                

                                {/*here is the search bar is, search 4 */}
                                <Search id = "search1">
                                    <SearchIconWrapper>
                                        <SearchIcon/>
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        id = "ibase"
                                        placeholder="Search…"
                                        inputProps={{'aria-label': 'search'}}
                                        onChange={(e) => {
                                            this.searchSpace(e); 
                                            //console.log("searchInput : " + e.target.value);
                                            
                                        }}   //searchbar
                                    />
                                </Search>
                                <Box sx={{flexGrow: 1}}/>
                                <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                    
                                </Box>





                                <Button autoFocus color="inherit" onClick={() => this.saveSelectedClub()}>
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
                                <h4>Total: {joinClubs.length}</h4></ListSubheader>}
                        >
                                {joinClubs.filter((data) =>{
                                    //debugger;
                                            //console.log( "data_name: " + data.club_name);
                                            console.log("check search: ===========> " + searchTermArray);
                                            //return data;
                                            
                                            if(this.state.search == null)
                                            {
                                                searchTerm = true;
                                                searchTermArray.push(true);
                                                return data
                                            }
                                                
                                            else if(data.club_name.toLowerCase().includes(this.state.search.toLowerCase())){
                                                searchTerm = true;
                                                searchTermArray.push(data.club_name.toLowerCase().includes(this.state.search.toLowerCase()));
                                                return data
                                            } 
                                            if(data.club_name.toLowerCase().includes(this.state.search.toLowerCase()) == false)
                                            {
                                                searchTermArray.push(data.club_name.toLowerCase().includes(this.state.search.toLowerCase())); 
                                            }

                                            if(this.checkSearch(searchTermArray) == false) searchTerm = false;
                                            else searchTerm = true;

                                        }).map((item, index) => {
                                            
                                const id = item.id;
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
                                                    checked={clubIdList.indexOf(id) !== -1}
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            }>
                                            <ListItemButton>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={item.logo_url}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={item.club_name}
                                                    secondary={item.desc}
                                                    onClick={() => this.handleJoinClubSelect(id)}
                                                    style={{textAlign: 'center'}}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </div>
                                );
                            })}
                            {joinClubs.length === 0 && (
                                <h4>Oooops! No clubs yet...</h4>
                            )}
                            {
                                searchTerm === false && (
                                    <h4>You may have joined this club! or it has yet to be made, make it now?</h4>
                                )
                            }
                            
                        </List>
                    </Dialog>
                </div>
            </Box>
        );
    }
}

const condition = authUser => !!authUser;
export default compose(withFirebase, withAuthUser, withAuthorization(condition))(LandingPage);