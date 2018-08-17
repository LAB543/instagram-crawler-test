const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const args = process.argv;

let scrape = async () => {
  const browser = await puppeteer.launch({
/*    executablePath: __dirname + "/headless_shell", */
    executablePath: "/usr/bin/google-chrome-stable",
    dumpio: false,
    devtools: false,
    args: [
      '--no-sandbox',
      '--vmodule',
      '--single-process'
    ]
  });

  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/'+args[2]);
  //await page.waitFor(5000);

  const result = await page.evaluate(() => document.body.innerHTML);

  await browser.close();

  return result;
};


scrape().then((value) => {
  const $ = cheerio.load(value);

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

  console.log(data); // Success!
});
