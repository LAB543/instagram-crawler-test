const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
require('dotenv').config();
const args = process.argv;

var chromePath = '/usr/bin/google-chrome-stable';

let scrape = async () => {

  if (!fs.existsSync(chromePath)) {
    chromePath = null;
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: process.env.IS_DEV ? false : true,
    slowMo: process.env.IS_DEV ? 250 : 0,
    dumpio: process.env.IS_DEV ? true : false,
    devtools: process.env.IS_DEV ? true : false,
    args: [
      '--no-sandbox',
      '--vmodule',
      '--single-process'
    ]
  });

  const page = await browser.newPage();

  // for debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://www.instagram.com/'+args[2]);

  //await page.waitFor(5000);

  await page.evaluate(() => document.body.innerHTML)
    .then((html) => {
      var $ = cheerio.load(html);

      var username = $('h1.AC5d8').text();
      var nickname = $('h1.rhpdm').text();
      var description = $('span', $('div.-vDIg').html()).text();
      var postCount = $('span.g47SY', $('li', $('ul.k9GMp'))[0]).attr('title')
        ? parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[0]).attr('title').replace(',',''))
        : parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[0]).text().replace(',',''));
      var followers = $('span.g47SY', $('li', $('ul.k9GMp'))[1]).attr('title')
        ? parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[1]).attr('title').replace(',',''))
        : parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[1]).text().replace(',',''));
      var following = $('span.g47SY', $('li', $('ul.k9GMp'))[2]).attr('title')
        ? parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[2]).attr('title').replace(',',''))
        : parseInt($('span.g47SY', $('li', $('ul.k9GMp'))[2]).text().replace(',',''));

      var data = {
        'username': username,
        'nickname': nickname,
        'description': description,
        'postCount': postCount,
        'followers': followers,
        'following': following
      };

      var pics = [];
      $('.v1Nh3').each((i,e) => {
        /*
        pics.push({
          'id': '',
          'description': e.children[0].alt,
          'src': e.children[0].src,
          'srcset': e.children[0].srcset
        });
        */
        pics.push({
          'url': e.children[0].attribs.href,
          'desc': $('.KL4Bh > img', e)[0].attribs.alt,
          'src': $('.KL4Bh > img', e)[0].attribs.src,
          'etc': $('.KL4Bh > img', e)[0].attribs
        });
      });

      console.log(data); // Success!
      console.log(pics); // Success!
      console.log(pics.length); // Success!


    });
  await page.evaluate(() => {
      window.scrollTo(0,document.body.scrollHeight);
  });
  await page.waitFor(3000);
  await page.evaluate(() => document.body.innerHTML)
    .then((html) => {
      var $ = cheerio.load(html);
      console.log($('.v1Nh3').length);
    });

  return browser;
};


scrape().then((browser) => {
  //browser.close();
});