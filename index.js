const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const newspapers = [
    {
        name: 'yellowsystems',
        address: 'https://yellow.systems/blog/web-development-future-trends',
        base: ''
    }
]

const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("technology")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my Tech Trends API')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/new/:newspaperID', (req, res) => {
    const newspaperID = req.params.newspaperID
    
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name === newspaperID)[0].address
    const newspaperBase = newspapers.filter(newspaper.name === newspaperID)[0].base
})