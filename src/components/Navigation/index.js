import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from "recompose";
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';

import logo from "../../img/logo/logo.png";
import * as ROUTES from "../../constants/routes";
import {withFirebase} from "../Firebase";
import Avatar from "@material-ui/core/Avatar";
import {withAuthUser} from "../Session";

class Navigation extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            anchorEl: null,
            mobileMoreAnchorEl: null,
            loaded: false,
        };
    }

    componentDidMount () {
    }


    componentDidUpdate () {
    }


    render() {
        const isMenuOpen = Boolean(this.state.anchorEl);
        const isMobileMenuOpen = Boolean(this.state.mobileMoreAnchorEl);

        const handleLogoClick = (event) => {
            this.props.history.push(ROUTES.LANDING);
        };

        const handleProfileMenuOpen = (event) => {
            this.setState({anchorEl: event.currentTarget})
        };

        const handleMobileMenuClose = () => {
            this.setState({mobileMoreAnchorEl: null})
        };

        const handleMenuClose = () => {
            this.setState({anchorEl: null});
            handleMobileMenuClose();
        };

        const handleAccountClick = () => {
            handleMenuClose();
            this.props.history.push(ROUTES.ACCOUNT);
        };

        const handleSignOutClick = () => {
            handleMenuClose();
            this.props.firebase.doSignOut();
        };

        const menuId = 'primary-search-account-menu';
        const renderMenu = (
            <Menu
                anchorEl={this.state.anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                id={menuId}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleAccountClick}>My account</MenuItem>
                <MenuItem onClick={handleSignOutClick}>Sign Out</MenuItem>
            </Menu>
        );

        const mobileMenuId = 'primary-search-account-menu-mobile';
        const renderMobileMenu = (
            <Menu
                anchorEl={this.state.mobileMoreAnchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                id={mobileMenuId}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
            >
                <MenuItem onClick={handleProfileMenuOpen}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="primary-search-account-menu"
                        aria-haspopup="true"
                        color="inherit"
                    >
                        <AccountCircle/>
                    </IconButton>
                    <p>Sign Out</p>
                </MenuItem>
            </Menu>
        );
        let helloWords = null;
        if (this.props.authUser) {
            helloWords = "Hello, " + this.props.authUser.email
        } else {
            return null;
        }
        return (
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar sx={{backgroundColor: "rgb(2,114,50)"}}>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleLogoClick}
                                color="inherit"
                            >
                                <Avatar
                                    src={logo}
                                />
                            </IconButton>
                        </Box>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <h3>&nbsp;&nbsp;&nbsp;Clubventory</h3>
                        </Box>
                        <Box sx={{flexGrow: 1}}/>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <h5>{helloWords}</h5>
                        </Box>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircle/>
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                {renderMobileMenu}
                {renderMenu}
            </Box>
        );
    }
}
export default compose(withFirebase, withRouter, withAuthUser)(Navigation);