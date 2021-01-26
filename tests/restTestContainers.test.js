const supertest = require('supertest');
const app = require('../src/app');
const request = supertest(app);
const AWS = require('aws-sdk');
const {GenericContainer} = require("testcontainers");
const createTableIfNotExist = require("../src/db/createTable");

let dynamoDBContainer;

beforeAll(async () => {
    dynamoDBContainer = await new GenericContainer("amazon/dynamodb-local", "1.13.6")
        .withExposedPorts(8000)
        .start().catch((err) => {
             console.log(err)
        });

    AWS.config.update({
        region: 'local',
        endpoint: `http://localhost:${dynamoDBContainer.getMappedPort(8000)}`,
        accessKeyId: "xxxxxx",
        secretAccessKey: "xxxxxx"
    });

    await createTableIfNotExist("films");
});

afterEach(async () => {
    await new AWS.DynamoDB().deleteTable({TableName: "films"}).promise();
    await createTableIfNotExist("films");
})
  
afterAll(async () => {
    await dynamoDBContainer.stop();
});

test('findAll', async () => {

    let response = await request.get('/api/films/')
        .expect(200);  

    await request.post('/api/films/').send({'title':'Judas and the Black Messiah','year':2021,'director':'Shaka King'});
    await request.post('/api/films/').send({'title':'I Care a Lot','year':2021,'director':'J Blakeson'});

    response = await request.get('/api/films/')
        .expect(200);  
        
    
    expect(response.body[0]['title']).toBe('I Care a Lot');
    expect(response.body[0]['year']).toBe(2021);
    expect(response.body[0]['director']).toBe('J Blakeson');
    expect(response.body[1]['title']).toBe('Judas and the Black Messiah');
    expect(response.body[1]['year']).toBe(2021);
    expect(response.body[1]['director']).toBe('Shaka King');
    
});
  
  
test('save', async () => {

    await request.post('/api/films/').send({'title':'F9','year':2021,'director':'Justin Lin'});

    const response = await request.get('/api/films/')
        .expect(200);  
  
    expect(response.body[0]['title']).toBe('F9');
    expect(response.body[0]['year']).toBe(2021);
    expect(response.body[0]['director']).toBe('Justin Lin');

});