import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import {styled} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

const PasswordForgetPage = () => (
    <div>
        <PasswordForgetForm />
    </div>
);

const INITIAL_STATE = {
    email: '',
    error: null,
};

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    width: '50%',
    height: 600,
    textAlign: 'center',
    //display: 'flex',
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

class PasswordForgetFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { email } = this.state;

        this.props.firebase
            .doPasswordReset(email)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
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
        const { email, error } = this.state;

        const isInvalid = email === '';

        return (
            <Box m={4}>
            	<Grid container spacing={2} sx={{
                	    display: 'flex',
                    	justifyContent: 'center',
                	}}>
            		<Item>
						<SubItem>
            				<Typography variant="h4" sx={{
                	    			color: "rgb(2,114,50)",
                    				fontWeight: "bold"
                				}}>Reset Password
            				</Typography>
						</SubItem>
						<SubItem>
            				<form onSubmit={this.onSubmit}> 
                				<TextField
                    				fullWidth
                    				name="email"
	                                value={this.state.email}
                                    variant="outlined"
                    				label="Email Address"
	                                onChange={this.onChange}
	                                type="text"
	                                placeholder="Email Address"
                				/>
                				<Button
                    				sx={{marginTop: "20px", backgroundColor: "rgb(2,114,50)"}}
                    				fullWidth
                    				type="submit"
                    				variant="contained"
                    				disabled={isInvalid}
                				>
                    				Reset My Password
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

const PasswordForgetLink = () => (
    <p>
        <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
    </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };