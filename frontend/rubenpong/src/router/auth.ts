import axios from 'axios';

/*
 * This class contains all the data and logic for authentication
 */
export class auth {

  static isLoggedIn(): boolean {
    return true;
    const cookie = document.cookie;
    if (!cookie) {
      console.log('No cookie found');
      return false;
    }
    return this.authorizeUser(cookie);
  }

  /*
   * Request an authrization check from the backend
   */
  private static authorizeUser(cookie: String): boolean {
    axios.post('http://localhost:3000/auth/authorize', {
      cookie: cookie
    })
      .then((response) => {
        console.log('response:', response.status, response.statusText);
        if (response.status === 200) {
          console.log('User authorized', response.data.user_login);
          return true;
        }
        else if (response.status === 401) {
          console.log('User not authorized');
          return false;
        }
      })
      .catch((error) => {
        console.log('Error authorizing user: ', error);
      });
    console.log('Do you see some errors regarding CORS? This is excepted behaviour for now');
    console.log('For debugging purposes, we will assume the user is authorized!');
    return true;
  }
}