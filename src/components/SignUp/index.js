import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import {styled} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import logo from "../../img/logo/logo.png";

const SignUpPage = () => (
    <div>
        <SignUpForm />
    </div>
);

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 600,
    textAlign: 'center',
    display: 'block',
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

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { INITIAL_STATE };
    }

    onSubmit = event => {
        const { username, email, passwordOne } = this.state;
        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                // Create a user in your Firebase realtime database
                return this.props.firebase
                    .user(authUser.user.uid, username, email);
            })
            .then(authUser => {
                this.setState({ INITIAL_STATE });
                this.props.history.push(ROUTES.LANDING);
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            error,
        } = this.state;
        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '';

        return (
            <Box m={4} sx={{display: 'flex', position: 'relative'}}>
                <img src={logo} height={140} width={140} display={'fixed'}/>
				<Typography sx={{
						color: "rgb(2,114,50)",
						fontWeight: "bold",
						fontSize: "50px",
						position: 'absolute',
						top: 110,
						left: 250,
						display: 'block'
					}}><div>Welcome to</div><div>Clubventory!</div>
				</Typography>
                <Grid container spacing={2} sx={{
                	    display: 'flex',
                    	justifyContent: 'right'
                	}}>
                    <Item>
                        <SubItem>
            				<Typography variant="h4" sx={{
                	    			color: "rgb(2,114,50)",
                    				fontWeight: "bold"
                				}}>Sign Up
            				</Typography>
						</SubItem>
                        <SubItem>
                            <form onSubmit={this.onSubmit}>
                                <TextField
                                    fullWidth
                                    name="username"
                                    value={username}
                                    variant="outlined"
                                    label="Full Name"
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Full Name"
                                />
                                <TextField
                                    sx={{marginTop: "20px"}}
                                    fullWidth
                                    name="email"
                                    value={email}
                                    variant="outlined"
                                    label="Email Address"
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Email Address"
                                />
                                <TextField
                                    sx={{marginTop: "20px"}}
                                    fullWidth
                                    name="passwordOne"
                                    value={passwordOne}
                                    variant="outlined"
                                    label="Password"
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Password"
                                />
                                <TextField
                                    sx={{marginTop: "20px"}}
                                    fullWidth
                                    name="passwordTwo"
                                    value={passwordTwo}
                                    variant="outlined"
                                    label="Confirm Password"
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Confirm Password"
                                />
                                <Button
                    				sx={{marginTop: "20px", backgroundColor: "rgb(2,114,50)"}}
                    				fullWidth
                    				type="submit"
                    				variant="contained"
                    				disabled={isInvalid}
                				>
                    				Sign Up
                				</Button>

                                {error && <p>{error.message}</p>}
                            </form>
                        </SubItem>
                    </Item>
                </Grid>
            </Box>
        );
    }
}

const SignUpLink = () => (
    <p>
        Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    </p>
);

const SignUpForm = compose(
    withRouter,
    withFirebase,
)(SignUpFormBase);

export default SignUpPage;

export {SignUpForm, SignUpLink};