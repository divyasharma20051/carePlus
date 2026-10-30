const controllers = {
  ...require('./auth/registerController'),
  ...require('./auth/loginController'),
  ...require('./auth/meController'),
  ...require('./auth/logoutController'),
  ...require('./doctor/listDoctorsController'),
  ...require('./appointment/startAppointmentOTPController'),
  ...require('./appointment/verifyAppointmentOTPController'),
  ...require('./appointment/myAppointmentsController'),
  ...require('./appointment/cancelAppointmentController'),
  ...require('./appointment/updateAppointmentStatusController'),
  ...require('./admin/adminDashboardController'),
  ...require('./admin/approveDoctorController'),
  ...require('./admin/deleteUserController'),
  ...require('./package/listPackagesController'),
  ...require('./package/packageDetailsController'),
  ...require('./enquiry/submitEnquiryController'),
  ...require('./location/locationsController'),
  ...require('./career/careerController'),
    ...require('./career/applyCareerController'),
  
};
module.exports = controllers;
