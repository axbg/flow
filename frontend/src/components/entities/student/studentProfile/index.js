import React, { Component } from 'react';
import "./index.css";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

class StudentProfile extends Component {

    constructor() {
        super();

        //will be received as props
        this.state = {
            readOnly: true,
            cashier: true
        }
    }

    onSubmit = () => {

    }

    onChange = () => {

    }

    render() {
        return (
            <div>
                <h1>Profile</h1>
                <img className="big-avatar" alt="" src="data:image/png;base64,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" />

                {
                    !this.state.readOnly
                        ? <div>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                multiple
                                type="file"
                            />
                            <label htmlFor="raised-button-file">
                                <Button color="primary" variant="contained" component="span" >
                                    Upload photo
                                    </Button>
                            </label>
                        </div>
                        : ""
                }
                <div className="student-profile-info">
                    <ValidatorForm ref="form" onSubmit={this.onSubmit} onError={errors => console.log(errors)}>
                        <TextValidator
                            fullWidth
                            label="First Name"
                            onChange={this.change}
                            name="firstName"
                            value={this.state.firstName}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Last Name"
                            onChange={this.change}
                            name="lastName"
                            value={this.state.lastName}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Email"
                            onChange={this.change}
                            name="email"
                            value={this.state.email}
                            validators={['required', 'isEmail']}
                            errorMessages={['This field is required', 'not a valid email address']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            type="password"
                            label="Password"
                            onChange={this.change}
                            name="password"
                            value={this.state.password}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Father's Initial"
                            onChange={this.change}
                            name="initial"
                            value={this.state.initial}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Phone"
                            onChange={this.change}
                            name="phone"
                            value={this.state.phone}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="PIN"
                            onChange={this.change}
                            name="cnp"
                            value={this.state.cnp}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="ID Series"
                            onChange={this.change}
                            name="idSeries"
                            value={this.state.idSeries}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="ID Number"
                            onChange={this.change}
                            name="idNumber"
                            value={this.state.idNumber}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="ID published by"
                            onChange={this.change}
                            name="idEntity"
                            value={this.state.idEntity}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Address"
                            onChange={this.change}
                            name="address"
                            value={this.state.address}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="City"
                            onChange={this.change}
                            name="city"
                            value={this.state.city}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Baccalaureate Average Grade"
                            onChange={this.change}
                            name="bacAverage"
                            value={this.state.bacAverage}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="Baccalaureate - Romanian Exam Grade"
                            onChange={this.change}
                            name="bacRomanian"
                            value={this.bacRomanian}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="9th Grade Average"
                            onChange={this.change}
                            name="average9"
                            value={this.state.average9}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="10th Grade Average"
                            onChange={this.change}
                            name="average10"
                            value={this.state.average10}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="11th Grade Average"
                            onChange={this.change}
                            name="average11"
                            value={this.state.average11}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <TextValidator
                            fullWidth
                            label="12th Grade Average"
                            onChange={this.change}
                            name="average12"
                            value={this.state.average12}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            variant="outlined"
                            InputProps={{
                                readOnly: this.state.readOnly,
                            }}
                        />
                        <br />
                        <br />
                        <br />
                        {
                            !this.state.readOnly ? <Button type="submit" color="primary" variant="contained" label="Submit" >Update Data</Button>
                                : ""
                        }
                    </ValidatorForm>
                </div>
                <br />
                {
                    !this.state.readOnly ?
                        <div className="student-options">
                            <div className="student-credits-table-container">
                                <Paper>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Faculty</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>1</TableCell>
                                                <TableCell>CSIE Buget</TableCell>
                                                <TableCell><Button>Remove</Button></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </div>
                            <br />
                            <br />
                            <div className="options-select">
                                <div className="select">
                                    <select className="select-text" required>
                                        <option value="" disabled></option>
                                        <option value="1">CSIE - Taxa</option>
                                        <option value="2">FABBV - Buget</option>
                                        <option value="3">FABBV - Taxa</option>
                                    </select>
                                    <span className="select-highlight"></span>
                                    <span className="select-bar"></span>
                                    <label className="select-label">Options</label>
                                </div>
                                <br />
                                <Button variant="contained" color="primary">Add Option</Button>
                            </div>
                        </div> : ""
                }
            </div>
        )
    }
}

export default StudentProfile;