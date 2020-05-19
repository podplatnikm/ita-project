export const requestBodyInvalid = 'Request body invalid.';
export const emailNotUnique = 'User with that email already exists.';
export const registrationOk = 'User registration successful!';
export const loginOk = 'Login successful';
export const badCredentials = 'User with those credentials does not exist.';
export const roleNotExist = 'Role does not exist';
export const userNotExist = 'User does not exist';
export const userAlreadyAssignedRole = 'User has already been assigned provided role.';
export const roleAssigned = 'Role assigned successfully';
export const roleRemoved = 'Role removed successfully';
export const weakPassword = 'Password is too weak. Should be between 6 and 20 characters.';
export const userWithRoleNotFound = 'User with provided role does not exist';
export const profoundWord = 'Value you provided is profane';
export const newPasswordMismatch = 'The values for the new password you provided do not match.';
export const samePassword = 'New and old password are the same.';
export const oldPasswordIncorrect = 'Old password does not match your current one.';
export const passwordChanged = 'Successfully changed password';
export const notOwner = 'You are not the owner/creator of this object';
export const notFound = (model: string) => `${model} could not be found.`;
export const meetStarted = 'This meet has already started thus you cannot request this action.';
export const meetAttendeeExists = 'You have already requested to join this meet.';
export const cannotAddParticipationToOwnMeet = 'You can not add a participation to a meet you started.';
