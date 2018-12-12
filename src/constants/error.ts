import * as Const from "./const";

/* Authentication */
export const EM0001 = "Fail authentication";
export const EM0002 = "You have not permission to call request";
export const EM0003 = `You have been banned in ${Const.LOGIN_FAIL_EXPIRE_TIME}s, please try later`;
export const wrongTypeMoreSpec = "Wrong more spec type";

/* Users Module */
export const EM0100 = "Cannot register user, please try again.";
export const EM0101 = "Old password is required";
export const EM0102 = "Wrong old password";
export const EM0103 = "User not found";
export const EM0104 = "Password is required";
export const EM0105 = `Username must be have length shorter than ${Const.user.maxLenUsername} characters`;
export const EM0106 = `Username must be have length longer than ${Const.user.minLenUsername} characters`;
export const EM0107 = `Password must be have length longer than ${Const.user.minLenPassword} characters`;
export const EM0108 = `Password must be have length shorter than ${Const.user.maxLenPassword} characters`;
export const EM0109 = `Password must be include: english uppercase characters, lowercase characters, number digits, non-alphabetic characters`;
export const EM0110 = `Please enter a valid email address`;
export const EM0111 = `Email has been used`;
export const EM0112 = `Email is required`;
export const EM0113 = 'Password reset token is invalid or has expired.';
export const EM0114 = `Teacher is required`;
export const EM0115 = `Username is required`;
export const EM0116 = `Username was exist`;
export const EM0117 = `Please enter a valid phone number`;
export const EM0118 = `Number phone has been used.`;

/* Products Module */
export const EM0201 = `Category is required.`;
export const EM0202 = `Price is required.`;
export const EM0203 = `Image field in wrong format`;
export const EM0204 = `Title is required.`;

/* Categories Module */
export const EM0301 = `Category name is required.`;

/* Contacts Module */
export const EM0601 = 'Can\'t send email. Please try again.';
export const EM0602 = 'Name must be between 2 and 50 chars long';
export const EM0603 = 'Name is not required';
export const EM0604 = 'Email is invalid';
export const EM0605 = 'Student id is required';
export const EM0606 = 'Message is required';

/* File error */
export const EM1201 = 'File extension is not support, please choose another file.';
export const EM1202 = `Limit file size is ${Const.file.limitSizeUpload} bytes`;