export const verifyEmailTemplate = (link: string) => `
    <h2>Welcome to Quacker</h2>
    <hr>
    <p>Thanks for signing up with Quacker, now in order to start using Quacker, you need to verify your email with us.</p>
    <br>
    <a href="${link}">Verify Email</a>
`;
