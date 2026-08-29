/* istanbul ignore file */
import request from 'supertest';

const ServerTestHelper = {
  /**
   * Mendaftarkan pengguna baru lalu login untuk mendapatkan access token.
   * Dipakai pada functional test agar pengujian tetap melewati alur HTTP yang sebenarnya.
   */
  async registerAndLogin(app, {
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  } = {}) {
    const userResponse = await request(app)
      .post('/users')
      .send({ username, password, fullname });

    const loginResponse = await request(app)
      .post('/authentications')
      .send({ username, password });

    return {
      userId: userResponse.body.data.addedUser.id,
      accessToken: loginResponse.body.data.accessToken,
    };
  },
};

export default ServerTestHelper;
