const request = require('supertest');
const app = require('../src/app');

async function registerAndLogin(email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email, password: 'StrongPass1!' });
  return res.body.token;
}

describe('Task API', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin('owner@example.com');
  });

  test('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests', priority: 'High' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Write tests');
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.priority).toBe('High');
  });

  test('rejects a task without a title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no title here' });
    expect(res.status).toBe(422);
  });

  test('lists tasks with pagination', async () => {
    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: `Task ${i}` });
    }

    const res = await request(app)
      .get('/api/tasks?page=2&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.pagination.total).toBe(15);
    expect(res.body.pagination.page).toBe(2);
  });

  test('filters tasks by status', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Finish this' });

    await request(app)
      .put(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Still pending' });

    const res = await request(app)
      .get('/api/tasks?status=Completed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Finish this');
  });

  test('searches tasks by title/description', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Buy groceries', description: 'Milk and eggs' });
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Clean the house' });

    const res = await request(app)
      .get('/api/tasks?search=groceries')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Buy groceries');
  });

  test('updates a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original title' });

    const res = await request(app)
      .put(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title', status: 'Completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated title');
    expect(res.body.data.status).toBe('Completed');
  });

  test('deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Delete me' });

    const del = await request(app)
      .delete(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  test('does not let one user see another user\'s tasks', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Private task' });

    const otherToken = await registerAndLogin('other@example.com');
    const res = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  test('rejects requests without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
