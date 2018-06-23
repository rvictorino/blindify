require('dotenv').config()
const express = require('express')
const request = require('request-promise-native')
const bodyParser = require('body-parser')

const app = express()


const search_url = 'https://api.spotify.com/v1/search'
const token_url = 'https://accounts.spotify.com/api/token'

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET


let token = {
  access_token: null,
  expiration_date: new Date()
}
let getToken = () => {
  return new Promise((resolve, reject) => {
    if (token.access_token != null) {
      resolve(token)
    } else {

      let params = {
        url: token_url,
        form: {
          'grant_type': 'client_credentials'
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
      }

      request.post(params)
        .then((res) => {

          let json = JSON.parse(res)
          let now = new Date()
          now.setSeconds(now.getSeconds() + Number(json.expires_in))

          token.expiration_date = now
          token.access_token = json.access_token

          resolve(token)
        })
        .catch((res) => console.log(res.message))
    }
  })
}


// static files
app.use(express.static('public'))

// parse form data as json
app.use(bodyParser.json())

// index
app.get('/', (req, res) => {})



app.get('/track', (req, res) => {

  getToken()
    .then((token) => {

      let params = {
        url: search_url,
        qs: {
          type: 'track',
          limit: '1',
          q: 'a',
          offset: Math.floor(Math.random() * 10000) + ''
        },
        headers: {
          'authorization': 'Bearer ' + token.access_token
        }
      }

      return request(params)
    })
    .then((resp) => {
      let track = JSON.parse(resp).tracks.items[0]
      let response = {
        url: track.preview_url,
        artists: track.artists.map((a) => a.name),
        title: track.name
      }
      res.send(JSON.stringify(response))
    })
    .catch((err) => console.log(err))

})


app.get('/token', (req, res) => {
  getToken()
    .then((token) => res.send(JSON.stringify(token)))
})

app.post('/artist-search', (req, res) => {

  getToken()
    .then((token) => {

      let params = {
        url: search_url,
        qs: {
          type: 'artist',
          limit: '5',
          q: req.body.search
        },
        headers: {
          'authorization': 'Bearer ' + token.access_token
        }
      }

      return request(params)
    })
    .then((resp) => {
      let artists = JSON.parse(resp).artists.items
      console.log(artists)
      res.send(JSON.stringify(artists))
    })
    .catch((err) => console.log(err))
})

app.listen(3000)