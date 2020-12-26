export const forgotPasswordTemplate = (link: string) => `
    <h2>Reset your password</h2>
    <hr>
    <p>Looks like you have forgotten your password, in order to change your password, go the link</p>
    <br>
    <a href="${link}">Change Password</a>
`;
