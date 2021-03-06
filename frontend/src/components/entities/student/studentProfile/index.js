import React, { Component } from 'react';
import "./index.css";
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Dialog, DialogTitle, DialogContent, DialogContentText } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import { Switch } from '@material-ui/core';
import SmartMultistepData from '../../../smart/smartMultistepData';
import { STUDENT_DEFAULT_IMAGE, PUBLIC_VAPID_KEY, BASE_URL } from '../../../../constants';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { changePassword, updateData } from '../../../../reducers/studentReducer';
import {
    addCredits, changeTaxStatus, getFormattedOptions, addOption, deleteOption,
    updateStudentDataAsUser, getFaculties, generateOrderNumber, enrollStudent
} from '../../../../reducers/volunteerReducer';
import { logout } from '../../../../reducers/authReducer';
import Webcam from 'react-webcam';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class StudentProfile extends Component {
    setRef = webcam => {
        this.webcam = webcam;
    };

    constructor() {
        super();

        this.state = {
            language: "RO",
            readOnly: false,
            currentPage: 0,
            maxCurrentPage: 3,
            modal: false,
            newPassword: "",
            newPasswordCheck: "",
            actualCredits: 0,
            credits: 0,
            tax: false,
            isTakingPicture: false,
            orderFacultyId: 0
        }

        this.openModal = this.openModal.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        if (this.props.userRole === "OPERATOR" || this.props.userRole === "ADMIN") {
            this.setState({
                maxCurrentPage: 4,
            })
        }

        if (this.props.userRole === "CASHIER") {
            this.setState({
                tax: this.props.userStudent.tax,
                actualCredits: this.props.userStudent.credits
            })
        }

        if (this.props.userRole === "VOLUNTEER" && !this.props.faculties) {
            this.props.getFaculties();
        }

        if ((this.props.studentData.enrolled || this.props.userStudent.enrolled) && this.props.userRole !== "ADMIN") {
            this.setState({
                readOnly: true
            })
        }
    }

    onChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    openModal() {
        this.setState({ modal: true })
    }

    handleClose() {
        this.setState({ modal: false })
    }

    submitNewPassword() {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (this.state.newPassword !== this.state.newPasswordCheck) {
            toastr.error("Parolele introduse nu coincid");
        } else if (!regex.test(this.state.newPassword)) {
            toastr.error("Parola nu respectă recomandările de securitate");
        } else {
            this.props.changePassword(this.state.newPassword);
            this.setState({ modal: false });
            toastr.success("Parola a fost actualizată");
        }
    }

    hasOptions = () => {
        if (this.props.userStudent.options.length > 0) {
            return this.props.userStudent.options[0].id
        }

        return false;
    }

    generateOrderNumber = () => {
        if (window.confirm("Ești sigur?")) {
            const facultyId = this.hasOptions() || this.state.orderFacultyId;
            this.props.generateOrderNumber({ facultyId: facultyId, studentId: this.props.userStudent.id });
            toastr.success("Bonul de ordine a fost generat!");
        }
    }

    openCameraModal = () => {
        this.setState({
            isTakingPicture: true,
        });

        this.openModal();
    }

    takePicture = () => {
        const picture = this.webcam.getScreenshot();
        this.props.updateStudentDataAsUser({ studentId: this.props.userStudent.id, data: { photo: picture } });
        this.webcam.stream.getVideoTracks()[0].stop();
        this.setState({
            isTakingPicture: false
        })
        this.handleClose();
    }

    urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    activateNotifications = async () => {
        if (Notification.permission !== 'granted') {
            const sw = await navigator.serviceWorker.getRegistration("/");
            const subscription = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });
            axios.post(BASE_URL + "/student/subscribe", { subscription: subscription });
        } else {
            toastr.info("Notificările sunt active");
        }
    }

    render() {
        return (
            < div className="student-profile-container" >
                <Dialog open={this.state.modal} onClose={this.handleClose} TransitionComponent={Transition}
                    keepMounted aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description">
                    {!this.state.isTakingPicture ?
                        <div>
                            <DialogTitle id="alert-dialog-slide-title">Actualizare parolă</DialogTitle>
                            <DialogContent className="password-modal-container">
                                <DialogContentText id="alert-dialog-slide-description">
                                    Parola trebuie să aibă dimensiunea minimă de 8 caractere și
                                    să conțină minim o literă mare, o literă mică, o cifră și un simbol
                                </DialogContentText>
                                <input type="password" name="newPassword" placeholder="Inserează noua parolă" value={this.state.newPassword} onChange={this.onChange} />
                                <input type="password" name="newPasswordCheck" placeholder="Repetă parola" value={this.state.newPasswordCheck} onChange={this.onChange} />
                                <Button onClick={() => this.submitNewPassword()} color="primary" variant="contained" component="span" >
                                    Salvează
                                </Button>
                            </DialogContent>
                        </div>
                        :
                        <div>
                            <DialogTitle id="alert-dialog-slide-title">Fotografie de profil</DialogTitle>
                            <DialogContent className="password-modal-container">
                                <Webcam audio={false}
                                    height={350}
                                    ref={this.setRef}
                                    screenshotFormat="image/jpeg"
                                    width={350} />
                                <Button onClick={() => this.takePicture()} color="primary" variant="contained" component="span" >
                                    Salvează
                                </Button>
                            </DialogContent>
                        </div>
                    }
                </Dialog>
                <img className="big-avatar" alt=""
                    src={this.props.studentData.photo || this.props.userStudent.photo ? (this.props.studentData.photo ? this.props.studentData.photo : this.props.userStudent.photo) : STUDENT_DEFAULT_IMAGE} />
                {
                    this.props.studentRole === "STUDENT" ?
                        <div className="student-profile-icon-container">
                            <img width="30" height="30" src="/password.png" style={{ cursor: "pointer" }} onClick={() => this.openModal()}
                                alt="PASSWORD" />
                            <img width="30" height="30" src="/notifications.png" style={{ cursor: "pointer" }} onClick={() => this.activateNotifications()}
                                alt="NOTIFICATIONS" />
                        </div>
                        : ""
                }
                {
                    this.props.studentRole === "STUDENT" ?
                        <div className="student-profile-icon-container">
                            <Button color="primary" variant="contained" component="span" onClick={() => this.props.logout()}>
                                Logout
                            </Button>
                        </div>
                        : ""
                }
                {
                    this.props.userRole === "OPERATOR" && !this.state.readOnly ?
                        <div>
                            <Button color="primary" variant="contained" component="span" onClick={() => this.openCameraModal()} >
                                Încarcă Fotografie
                                </Button>
                        </div> :
                        (this.props.userRole === "CASHIER" ?
                            <div>
                                <p>Număr curent de credite: {this.state.actualCredits}</p>
                                <input className="cashier-credits-input" type="number" min="-20" max="20"
                                    value={this.state.credits} name="credits" onChange={(e) => this.onChange(e)} />
                                <Button color="primary" variant="contained" component="span"
                                    onClick={() => {
                                        this.setState({ actualCredits: this.state.actualCredits + parseInt(this.state.credits) });
                                        this.props.addCredits({ studentId: this.props.userStudent.id, credits: parseInt(this.state.credits) });
                                        toastr.success("Credite actualizate");
                                    }}>
                                    Adaugă credite
                                </Button>

                                <Switch
                                    checked={this.state.tax}
                                    onChange={() => {
                                        this.setState({ tax: !this.state.tax });
                                        this.props.changeTaxStatus(this.props.userStudent.id);
                                        toastr.success("Taxa a fost actualizată");
                                    }}
                                    value="true"
                                    color="primary"
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                />
                                <span>Taxă</span>
                            </div> : (this.props.userRole === "VOLUNTEER" ?
                                <div>
                                    {
                                        !this.hasOptions() && this.props.faculties ?
                                            <div className="select">
                                                <select className="select-text" name="orderFacultyId" onChange={(e) => this.onChange(e)} value={this.state.orderFacultyId} >
                                                    {this.props.faculties.map((faculty, key) => <option key={key} value={faculty.id}>{faculty.name}</option>)}
                                                </select>
                                                <span className="select-highlight"></span>
                                                <span className="select-bar"></span>
                                                <label className="select-label">Facultate</label>
                                                <br />
                                            </div>
                                            : ""
                                    }
                                    <Button onClick={this.generateOrderNumber} color="primary" variant="contained" component="span" >
                                        Generează bon de ordine
                                    </Button>
                                </div>
                                : "")
                        )
                }
                <div className="student-profile-info">
                    <Paper className="student-profile-data-paper">
                        <SmartMultistepData role={this.props.studentRole ? this.props.studentRole : this.props.userRole}
                            student={this.props.studentRole ? this.props.studentData : this.props.userStudent}
                            updateData={this.props.studentRole ? this.props.updateData : this.props.updateStudentDataAsUser} formattedOptions={this.props.formattedOptions}
                            getFormattedOptions={this.props.getFormattedOptions}
                            addOption={this.props.addOption} deleteOption={this.props.deleteOption} />
                    </Paper>
                </div>
                {
                    this.props.userRole === "OPERATOR" && !this.props.userStudent.enrolled ?
                        <div>
                            <Button color="primary" variant="contained" component="span" onClick={() => {
                                this.props.enrollStudent(this.props.userStudent.id);
                                toastr.success("Înscrierea a fost confirmată");
                            }} >
                                Confirmă înscrierea
                            </Button>
                        </div> : ""
                }
            </div >
        )
    }
}

const mapStateToProps = ({ studentReducer, volunteerReducer }) => ({
    studentRole: studentReducer.role,
    studentData: studentReducer,
    userRole: volunteerReducer.role,
    userStudent: volunteerReducer.student,
    formattedOptions: volunteerReducer.formattedOptions,
    faculties: volunteerReducer.faculties
});

const mapDispatchToProps = {
    changePassword, updateData, logout, addCredits, changeTaxStatus,
    getFormattedOptions, addOption, deleteOption, updateStudentDataAsUser,
    getFaculties, generateOrderNumber, enrollStudent
};

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfile);