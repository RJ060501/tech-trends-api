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
    //TODO: Add more newspapers to collect more data
]

const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a', html).each(function () {
                if ($(this).attr('href').startsWith("https")) {
                    const title = $(this).text()
                    const url = $(this).attr('href')
    
                    articles.push({
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name
                    })
                }
            })
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my Tech Trends API')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperID', (req, res) => {
    const newspaperID = req.params.newspaperID
    
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperID)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperID)[0].base

    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a', html).each(function () {
                if ($(this).attr('href').startsWith("https")) {
                    const title = $(this).text()
                    const url = $(this).attr('href')
    
                    specificArticles.push({
                        title,
                        url: newspaperBase + url,
                        source: newspaperID
                    })
                }
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))