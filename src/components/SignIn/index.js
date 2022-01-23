import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
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
import Avatar from "@material-ui/core/Avatar";


const SignInPage = () => (
    <SignInForm />
);

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

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

class SignInFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { email, password } = this.state;

        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.LANDING);
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, password, error } = this.state;

        const isInvalid = password === '' || email === '';

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
                				}}>Sign In
            				</Typography>
						</SubItem>
						<SubItem>
            				<form onSubmit={this.onSubmit}> 
                				<TextField
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
                    				name="password"
                    				value={password}
                    				variant="outlined"
                    				label="Password"
                    				onChange={this.onChange}
                    				type="password"
                    				placeholder="Password"
                				/>
                				<Button
                    				sx={{marginTop: "20px", backgroundColor: "rgb(2,114,50)"}}
                    				fullWidth
                    				type="submit"
                    				variant="contained"
                    				disabled={isInvalid}
                				>
                    				Sign In
                				</Button>

                				{error && <p>{error.message}</p>}
            				</form>
						</SubItem>
						<SubItem>
            				<PasswordForgetLink />
						</SubItem>
						<SubItem>
            				<SignUpLink />
						</SubItem>
            		</Item>
            	</Grid>
            </Box>
        );
    }
}

const SignInForm = compose(
    withRouter,
    withFirebase,
)(SignInFormBase);

export default SignInPage;

export { SignInForm };