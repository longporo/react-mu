import React from "react";
import {compose} from "recompose";
import {withFirebase} from "../Firebase";
import {withAuthorization, withAuthUser} from "../Session";
import Box from "@material-ui/core/Box";
import {AppBar, CardActionArea, Slide, styled} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Avatar from "@material-ui/core/Avatar";
import Switch from "@material-ui/core/Switch";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import ListItem from "@material-ui/core/ListItem";


import Dialog from "@material-ui/core/Dialog";

import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';


import {onValue} from 'firebase/database';

import * as MyUtils from "../../common/myUtils";
import {Link} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

import ItemViewPage from '../ItemView';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '88%',
    minHeight: 600,
    maxHeight: 600,
    overflow: 'auto',
    marginLeft: '6%',
    textAlign: 'center',
    backgroundColor: 'unset',
    color: theme.palette.text.secondary,
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SubItem = styled(Card)(({ theme }) => ({
    ...theme.typography.body2,
    margin: 20,
    display: "inline-block",
    width: 220,
    color: theme.palette.text.secondary,
}));

class MyItemsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
        };
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

    componentDidMount() {
        const {authUser, firebase} = this.props;
        // get items by uid
        onValue(firebase.getItemsByUid(authUser.uid), (snapshot) => {
            const result = snapshot.val();
            let itemList = MyUtils.keyObjToArray(result);
            if (itemList.length == 0) {
                this.setState({items: []});
                return;
            }
            // set club info
            let count = 0;
            itemList.map((item) => {
                firebase.getClubByIdPromise(item.club_id).then((value) => {
                    item.club = value;
                    count++;
                    if (count == itemList.length) {
                        this.setState({
                            items: itemList,
                        });
                    }
                });
            });
        });
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        firebase.offGetItemsByClubId();
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

    render() {
        const {items} = this.state;
        return (
            <Box m={4}>
                <Grid container spacing={2}>
                    <Item>
                        <Typography gutterBottom variant="h4" component="div" sx={{textAlign: "left", color: 'rgb(2,114,50)'}}>
                            My borrowed items
                        </Typography>
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
                                                    component={Link}
                                                    to={
                                                        {
                                                            pathname: ROUTES.CLUB_DETAIL,
                                                            state: {clubId: item.club.id}
                                                        }
                                                    }
                                                    src={item.club.logo_url}
                                                />
                                            </ListItemAvatar>
                                            <div style={{display: "contents"}}>
                                                <ListItemText primary={"Borrowing"}
                                                              style={{textAlign: 'center'}}/>
                                                <Switch
                                                    inputProps={{'aria-label': 'controlled'}}
                                                    defaultChecked
                                                    onChange={(e) => this.handleReturnItem(e, item.id)}
                                                />
                                            </div>
                                        </ListItem>
                                    </CardActions>
                                </SubItem>
                            ))
                        }
                        {items.length == 0 && (
                            <h3>Oooops! No items yet...</h3>
                        )}
                    </Item>

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
                </Grid>
            </Box>
        )
    }
}
const condition = authUser => !!authUser;
export default compose(withFirebase, withAuthUser, withAuthorization(condition))(MyItemsPage);