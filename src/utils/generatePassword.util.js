


/* eslint-disable no-plusplus */
const generatePassword = () => {

  // Variables
  const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseLetters = lowerCaseLetters.toUpperCase();
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>/?';

  const allCharacters = lowerCaseLetters + upperCaseLetters + numbers + symbols;

  // Generate Password
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomNumber = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters.charAt(randomNumber);
  }

  return password;

}



module.exports = {
  generatePassword
}