const supertest = require('supertest');
const app = require('../src/app');
const request = supertest(app);
const AWS = require('aws-sdk');

jest.mock('aws-sdk');


beforeAll(async () => {
    AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation((film, cb) => {
        cb(null, {'title':'F9','year':2021,'director':'Justin Lin'});
    });
    AWS.DynamoDB.DocumentClient.prototype.scan.mockImplementation((film, cb) => {
        cb(undefined, {
            Items: [
              {'title':'Judas and the Black Messiah','year':2021,'director':'Shaka King'},
              {'title':'I Care a Lot','year':2021,'director':'J Blakeson'}
            ]
        });
    });
})
  
test('findAll', async () => {
    
    const response = await request.get('/api/films/')
        .expect(200);  
        
    expect(response.body[0]['title']).toBe('Judas and the Black Messiah');
    expect(response.body[0]['year']).toBe(2021);
    expect(response.body[0]['director']).toBe('Shaka King');
    expect(response.body[1]['title']).toBe('I Care a Lot');
    expect(response.body[1]['year']).toBe(2021);
    expect(response.body[1]['director']).toBe('J Blakeson');
});
  
  
test('save', async () => {

    const movie = {'title': 'F9', 'year': 2021, 'director': 'Justin Lin'};
    
    const response = await request.post('/api/films/')
        .send(movie)
        .expect(201);
  
    expect(response.body['title']).toBe('F9');
    expect(response.body['year']).toBe(2021);
    expect(response.body['director']).toBe('Justin Lin');
});