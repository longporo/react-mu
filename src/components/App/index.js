import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import { withAuthentication } from '../Session';
import  Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import ClubDetailPage from '../ClubDetail';
import ClubAddPage from '../ClubAdd';
import ClubViewPage from '../ClubView';
import ItemAddPage from '../ItemAdd';
import ItemViewPage from '../ItemView';
import MyItemsPage from '../MyItems';
import AccountPage from '../Account';

import * as ROUTES from '../../constants/routes';
import { createTheme, ThemeProvider } from "@material-ui/core";

const theme = createTheme({
    typography: {
        fontFamily: 'MyFont'
    },
    overrides: {
        MuiButton: {
            root: {
                margin: "10px",
                padding: "10px"
            }
        }
    }
});
class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <ThemeProvider theme={theme}>
                    <Navigation/>
                    <Route exact path={ROUTES.LANDING} component={LandingPage}/>
                    <Route path={ROUTES.SIGN_UP} component={SignUpPage}/>
                    <Route path={ROUTES.SIGN_IN} component={SignInPage}/>
                    <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage}/>
                    <Route path={ROUTES.CLUB_ADD} component={ClubAddPage}/>
                    <Route path={ROUTES.CLUB_VIEW} component={ClubViewPage}/>
                    <Route path={ROUTES.CLUB_DETAIL} component={ClubDetailPage}/>
                    <Route path={ROUTES.MY_ITEMS} component={MyItemsPage}/>
                    <Route path={ROUTES.ITEM_ADD} component={ItemAddPage}/>
                    <Route path={ROUTES.ITEM_VIEW} component={ItemViewPage}/>
                    <Route path={ROUTES.ACCOUNT} component={AccountPage}/>
                </ThemeProvider>
            </Router>
        );
    }
}

export default withAuthentication(App);