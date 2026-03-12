"""
Build a curated list of major newspaper/news sources per country.
Focus: business, financial, and general news useful for investment/reshoring decisions.
Outputs: src/data/news_sources.json
"""
import json, os

OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'news_sources.json')

# Format: iso3 -> list of { name, url, type }
# type: "business" | "general" | "government" | "financial"
NEWS = {
    "USA": [
        {"name": "Wall Street Journal", "url": "https://www.wsj.com", "type": "financial"},
        {"name": "Bloomberg", "url": "https://www.bloomberg.com", "type": "financial"},
        {"name": "New York Times", "url": "https://www.nytimes.com", "type": "general"},
        {"name": "Reuters (US)", "url": "https://www.reuters.com/world/us/", "type": "general"},
    ],
    "GBR": [
        {"name": "Financial Times", "url": "https://www.ft.com", "type": "financial"},
        {"name": "The Economist", "url": "https://www.economist.com", "type": "financial"},
        {"name": "The Guardian", "url": "https://www.theguardian.com/uk", "type": "general"},
        {"name": "Reuters (UK)", "url": "https://www.reuters.com/world/uk/", "type": "general"},
    ],
    "DEU": [
        {"name": "Handelsblatt", "url": "https://www.handelsblatt.com/english/", "type": "financial"},
        {"name": "Der Spiegel (EN)", "url": "https://www.spiegel.de/international/", "type": "general"},
        {"name": "Deutsche Welle", "url": "https://www.dw.com/en/germany/s-1432", "type": "general"},
        {"name": "FAZ (EN)", "url": "https://www.faz.net/aktuell/wirtschaft/", "type": "business"},
    ],
    "FRA": [
        {"name": "Le Monde (EN)", "url": "https://www.lemonde.fr/en/", "type": "general"},
        {"name": "Les Échos", "url": "https://www.lesechos.fr", "type": "financial"},
        {"name": "France 24", "url": "https://www.france24.com/en/france/", "type": "general"},
        {"name": "Reuters (France)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "JPN": [
        {"name": "Nikkei Asia", "url": "https://asia.nikkei.com", "type": "financial"},
        {"name": "Japan Times", "url": "https://www.japantimes.co.jp", "type": "general"},
        {"name": "NHK World", "url": "https://www3.nhk.or.jp/nhkworld/en/news/", "type": "general"},
        {"name": "Bloomberg Japan", "url": "https://www.bloomberg.co.jp/news/", "type": "financial"},
    ],
    "CHN": [
        {"name": "South China Morning Post", "url": "https://www.scmp.com", "type": "general"},
        {"name": "Caixin Global", "url": "https://www.caixinglobal.com", "type": "financial"},
        {"name": "Xinhua (EN)", "url": "https://english.news.cn", "type": "government"},
        {"name": "China Daily", "url": "https://www.chinadaily.com.cn", "type": "government"},
    ],
    "IND": [
        {"name": "Economic Times", "url": "https://economictimes.indiatimes.com", "type": "financial"},
        {"name": "Business Standard", "url": "https://www.business-standard.com", "type": "business"},
        {"name": "Hindustan Times", "url": "https://www.hindustantimes.com", "type": "general"},
        {"name": "Mint", "url": "https://www.livemint.com", "type": "financial"},
    ],
    "BRA": [
        {"name": "Valor Econômico (EN)", "url": "https://valor.globo.com/en/", "type": "financial"},
        {"name": "Brazil Journal", "url": "https://braziljournal.com", "type": "financial"},
        {"name": "Agência Brasil (EN)", "url": "https://agenciabrasil.ebc.com.br/en", "type": "government"},
        {"name": "Reuters (Brazil)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "MEX": [
        {"name": "El Financiero", "url": "https://www.elfinanciero.com.mx", "type": "financial"},
        {"name": "El Universal (EN)", "url": "https://www.eluniversal.com.mx/english/", "type": "general"},
        {"name": "Mexico News Daily", "url": "https://mexiconewsdaily.com", "type": "general"},
        {"name": "Reuters (Mexico)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "CAN": [
        {"name": "Globe and Mail", "url": "https://www.theglobeandmail.com", "type": "general"},
        {"name": "Financial Post", "url": "https://financialpost.com", "type": "financial"},
        {"name": "CBC News", "url": "https://www.cbc.ca/news", "type": "general"},
        {"name": "BNN Bloomberg", "url": "https://www.bnnbloomberg.ca", "type": "financial"},
    ],
    "AUS": [
        {"name": "Australian Financial Review", "url": "https://www.afr.com", "type": "financial"},
        {"name": "The Australian", "url": "https://www.theaustralian.com.au", "type": "general"},
        {"name": "ABC News AU", "url": "https://www.abc.net.au/news/", "type": "general"},
        {"name": "Reuters (Australia)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "KOR": [
        {"name": "Korea Herald", "url": "https://www.koreaherald.com", "type": "general"},
        {"name": "Korea JoongAng Daily", "url": "https://koreajoongangdaily.joins.com", "type": "general"},
        {"name": "Korea Economic Daily", "url": "https://www.kedglobal.com", "type": "financial"},
        {"name": "Yonhap News", "url": "https://en.yna.co.kr", "type": "general"},
    ],
    "SGP": [
        {"name": "Straits Times", "url": "https://www.straitstimes.com", "type": "general"},
        {"name": "Business Times SG", "url": "https://www.businesstimes.com.sg", "type": "financial"},
        {"name": "Channel NewsAsia", "url": "https://www.channelnewsasia.com", "type": "general"},
        {"name": "Reuters (Singapore)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "HKG": [
        {"name": "South China Morning Post", "url": "https://www.scmp.com", "type": "general"},
        {"name": "Hong Kong Free Press", "url": "https://hongkongfp.com", "type": "general"},
        {"name": "RTHK News", "url": "https://news.rthk.hk/rthk/en/", "type": "general"},
        {"name": "Nikkei Asia", "url": "https://asia.nikkei.com", "type": "financial"},
    ],
    "ARE": [
        {"name": "The National", "url": "https://www.thenationalnews.com", "type": "general"},
        {"name": "Gulf News", "url": "https://gulfnews.com", "type": "general"},
        {"name": "Arabian Business", "url": "https://www.arabianbusiness.com", "type": "business"},
        {"name": "Khaleej Times", "url": "https://www.khaleejtimes.com", "type": "general"},
    ],
    "SAU": [
        {"name": "Arab News", "url": "https://www.arabnews.com", "type": "general"},
        {"name": "Saudi Gazette", "url": "https://saudigazette.com.sa", "type": "general"},
        {"name": "ARGAAM", "url": "https://www.argaam.com/en/", "type": "financial"},
        {"name": "Reuters (Saudi)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
    ],
    "ZAF": [
        {"name": "Business Day", "url": "https://www.businesslive.co.za/bd/", "type": "financial"},
        {"name": "Daily Maverick", "url": "https://www.dailymaverick.co.za", "type": "general"},
        {"name": "Mail & Guardian", "url": "https://mg.co.za", "type": "general"},
        {"name": "Reuters (Africa)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
    ],
    "NGA": [
        {"name": "Businessday Nigeria", "url": "https://businessday.ng", "type": "financial"},
        {"name": "The Punch", "url": "https://punchng.com", "type": "general"},
        {"name": "Vanguard Nigeria", "url": "https://www.vanguardngr.com", "type": "general"},
        {"name": "Reuters (Africa)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
    ],
    "EGY": [
        {"name": "Egypt Independent", "url": "https://www.egyptindependent.com", "type": "general"},
        {"name": "Daily News Egypt", "url": "https://dailynewsegypt.com", "type": "general"},
        {"name": "Al-Ahram (EN)", "url": "https://english.ahram.org.eg", "type": "general"},
        {"name": "Reuters (Egypt)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
    ],
    "TUR": [
        {"name": "Hürriyet Daily News", "url": "https://www.hurriyetdailynews.com", "type": "general"},
        {"name": "Daily Sabah", "url": "https://www.dailysabah.com", "type": "general"},
        {"name": "Dünya (EN)", "url": "https://www.dunya.com/en/", "type": "financial"},
        {"name": "Reuters (Turkey)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
    ],
    "IDN": [
        {"name": "Jakarta Post", "url": "https://www.thejakartapost.com", "type": "general"},
        {"name": "Kontan (EN)", "url": "https://international.kontan.co.id", "type": "financial"},
        {"name": "Reuters (Indonesia)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
        {"name": "Indonesia Investments", "url": "https://www.indonesia-investments.com/news/", "type": "business"},
    ],
    "MYS": [
        {"name": "The Star Malaysia", "url": "https://www.thestar.com.my", "type": "general"},
        {"name": "New Straits Times", "url": "https://www.nst.com.my", "type": "general"},
        {"name": "The Edge Malaysia", "url": "https://www.theedgemarkets.com", "type": "financial"},
        {"name": "Reuters (Malaysia)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "THA": [
        {"name": "Bangkok Post", "url": "https://www.bangkokpost.com", "type": "general"},
        {"name": "The Nation Thailand", "url": "https://www.nationthailand.com", "type": "general"},
        {"name": "Business Day TH", "url": "https://www.bangkokpost.com/business/", "type": "financial"},
        {"name": "Reuters (Thailand)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "VNM": [
        {"name": "VnExpress International", "url": "https://e.vnexpress.net", "type": "general"},
        {"name": "Vietnam News", "url": "https://vietnamnews.vn", "type": "general"},
        {"name": "Vietnam Investment Review", "url": "https://vir.com.vn", "type": "financial"},
        {"name": "Reuters (Vietnam)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "PHL": [
        {"name": "Philippine Daily Inquirer", "url": "https://www.inquirer.net", "type": "general"},
        {"name": "BusinessWorld PH", "url": "https://www.bworldonline.com", "type": "financial"},
        {"name": "Manila Bulletin", "url": "https://mb.com.ph", "type": "general"},
        {"name": "Reuters (Philippines)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "BGD": [
        {"name": "The Daily Star BD", "url": "https://www.thedailystar.net", "type": "general"},
        {"name": "Financial Express BD", "url": "https://thefinancialexpress.com.bd", "type": "financial"},
        {"name": "Dhaka Tribune", "url": "https://www.dhakatribune.com", "type": "general"},
        {"name": "Reuters (Bangladesh)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "PAK": [
        {"name": "Dawn Pakistan", "url": "https://www.dawn.com", "type": "general"},
        {"name": "The News International", "url": "https://www.thenews.com.pk", "type": "general"},
        {"name": "Business Recorder", "url": "https://www.brecorder.com", "type": "financial"},
        {"name": "Reuters (Pakistan)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "ARG": [
        {"name": "Buenos Aires Herald", "url": "https://www.buenosairesherald.com", "type": "general"},
        {"name": "Infobae (EN)", "url": "https://www.infobae.com/en/", "type": "general"},
        {"name": "Ambito Financiero", "url": "https://www.ambito.com", "type": "financial"},
        {"name": "Reuters (Argentina)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "CHL": [
        {"name": "El Mercurio", "url": "https://www.emol.com", "type": "general"},
        {"name": "Santiago Times", "url": "https://santiagotimes.cl", "type": "general"},
        {"name": "Diario Financiero", "url": "https://www.df.cl", "type": "financial"},
        {"name": "Reuters (Chile)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "COL": [
        {"name": "El Tiempo", "url": "https://www.eltiempo.com", "type": "general"},
        {"name": "Portafolio", "url": "https://www.portafolio.co", "type": "financial"},
        {"name": "Colombia Reports", "url": "https://colombiareports.com", "type": "general"},
        {"name": "Reuters (Colombia)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "PER": [
        {"name": "Peru Reports", "url": "https://perureports.com", "type": "general"},
        {"name": "El Comercio Peru", "url": "https://elcomercio.pe", "type": "general"},
        {"name": "Gestión", "url": "https://gestion.pe", "type": "financial"},
        {"name": "Reuters (Peru)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
    ],
    "NLD": [
        {"name": "Dutch News", "url": "https://www.dutchnews.nl", "type": "general"},
        {"name": "Het Financieele Dagblad", "url": "https://fd.nl", "type": "financial"},
        {"name": "NRC (EN)", "url": "https://www.nrc.nl/en/", "type": "general"},
        {"name": "Reuters (Netherlands)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "CHE": [
        {"name": "Swiss Info", "url": "https://www.swissinfo.ch/eng/", "type": "general"},
        {"name": "Neue Zürcher Zeitung (EN)", "url": "https://www.nzz.ch/english/", "type": "general"},
        {"name": "Reuters (Switzerland)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Bloomberg", "url": "https://www.bloomberg.com/europe", "type": "financial"},
    ],
    "SWE": [
        {"name": "The Local Sweden", "url": "https://www.thelocal.se", "type": "general"},
        {"name": "Svenska Dagbladet (EN)", "url": "https://www.svd.se", "type": "general"},
        {"name": "Reuters (Sweden)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Bloomberg Nordics", "url": "https://www.bloomberg.com/europe", "type": "financial"},
    ],
    "NOR": [
        {"name": "Aftenposten (EN)", "url": "https://www.aftenposten.no/meninger/", "type": "general"},
        {"name": "Dagens Næringsliv", "url": "https://www.dn.no", "type": "financial"},
        {"name": "The Norway Post", "url": "https://www.norwaypost.no", "type": "general"},
        {"name": "Reuters (Norway)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "DNK": [
        {"name": "The Local Denmark", "url": "https://www.thelocal.dk", "type": "general"},
        {"name": "Børsen", "url": "https://borsen.dk", "type": "financial"},
        {"name": "Copenhagen Post", "url": "https://cphpost.dk", "type": "general"},
        {"name": "Reuters (Denmark)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "FIN": [
        {"name": "Helsingin Sanomat (EN)", "url": "https://www.hs.fi/english/", "type": "general"},
        {"name": "Kauppalehti", "url": "https://www.kauppalehti.fi", "type": "financial"},
        {"name": "YLE News", "url": "https://yle.fi/uutiset/osasto/news/", "type": "general"},
        {"name": "Reuters (Finland)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "POL": [
        {"name": "Warsaw Business Journal", "url": "https://wbj.pl", "type": "financial"},
        {"name": "Notes from Poland", "url": "https://notesfrompoland.com", "type": "general"},
        {"name": "Reuters (Poland)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Rzeczpospolita (EN)", "url": "https://www.rp.pl", "type": "general"},
    ],
    "CZE": [
        {"name": "Prague Morning", "url": "https://praguemorning.cz", "type": "general"},
        {"name": "Czech News Agency", "url": "https://www.ceskenoviny.cz/en/", "type": "general"},
        {"name": "Reuters (Czechia)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Prague Business Journal", "url": "https://www.pbj.cz", "type": "financial"},
    ],
    "HUN": [
        {"name": "Budapest Business Journal", "url": "https://bbj.hu", "type": "financial"},
        {"name": "Daily News Hungary", "url": "https://dailynewshungary.com", "type": "general"},
        {"name": "Reuters (Hungary)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Portfolio.hu (EN)", "url": "https://www.portfolio.hu/en/", "type": "financial"},
    ],
    "ROU": [
        {"name": "Romania Insider", "url": "https://www.romania-insider.com", "type": "general"},
        {"name": "Business Review RO", "url": "https://business-review.eu", "type": "financial"},
        {"name": "Reuters (Romania)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Ziarul Financiar (EN)", "url": "https://www.zf.ro/english/", "type": "financial"},
    ],
    "UKR": [
        {"name": "Kyiv Independent", "url": "https://kyivindependent.com", "type": "general"},
        {"name": "Kyiv Post", "url": "https://www.kyivpost.com", "type": "general"},
        {"name": "Reuters (Ukraine)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Interfax Ukraine", "url": "https://en.interfax.com.ua", "type": "general"},
    ],
    "RUS": [
        {"name": "Moscow Times", "url": "https://www.themoscowtimes.com", "type": "general"},
        {"name": "TASS (EN)", "url": "https://tass.com", "type": "government"},
        {"name": "Kommersant (EN)", "url": "https://www.kommersant.ru/english/", "type": "financial"},
        {"name": "Reuters (Russia)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "ISR": [
        {"name": "Haaretz (EN)", "url": "https://www.haaretz.com", "type": "general"},
        {"name": "The Times of Israel", "url": "https://www.timesofisrael.com", "type": "general"},
        {"name": "Globes", "url": "https://en.globes.co.il", "type": "financial"},
        {"name": "Reuters (Israel)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
    ],
    "IRN": [
        {"name": "Tehran Times", "url": "https://www.tehrantimes.com", "type": "general"},
        {"name": "Financial Tribune Iran", "url": "https://financialtribune.com", "type": "financial"},
        {"name": "Iran International", "url": "https://www.iranintl.com/en", "type": "general"},
        {"name": "Reuters (Iran)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
    ],
    "KAZ": [
        {"name": "Astana Times", "url": "https://astanatimes.com", "type": "general"},
        {"name": "Kazinform", "url": "https://www.inform.kz/en/", "type": "general"},
        {"name": "Reuters (Kazakhstan)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
        {"name": "The Central Asian Bureau", "url": "https://cabar.asia/en/", "type": "general"},
    ],
    "NZL": [
        {"name": "NZ Herald", "url": "https://www.nzherald.co.nz", "type": "general"},
        {"name": "Stuff NZ", "url": "https://www.stuff.co.nz", "type": "general"},
        {"name": "BusinessDesk NZ", "url": "https://businessdesk.co.nz", "type": "financial"},
        {"name": "Reuters (NZ)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
    ],
    "IRL": [
        {"name": "Irish Times", "url": "https://www.irishtimes.com", "type": "general"},
        {"name": "Irish Examiner", "url": "https://www.irishexaminer.com", "type": "general"},
        {"name": "Business Post IE", "url": "https://businesspost.ie", "type": "financial"},
        {"name": "Reuters (Ireland)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "PRT": [
        {"name": "Público (EN)", "url": "https://www.publico.pt/en/", "type": "general"},
        {"name": "Expresso", "url": "https://expresso.pt", "type": "general"},
        {"name": "Jornal de Negócios", "url": "https://www.jornaldenegocios.pt", "type": "financial"},
        {"name": "Reuters (Portugal)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
    ],
    "ESP": [
        {"name": "El País (EN)", "url": "https://english.elpais.com", "type": "general"},
        {"name": "Cinco Días", "url": "https://cincodias.elpais.com", "type": "financial"},
        {"name": "Reuters (Spain)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Spain News", "url": "https://spanishnewstoday.com", "type": "general"},
    ],
    "ITA": [
        {"name": "Il Sole 24 Ore (EN)", "url": "https://www.ilsole24ore.com/art/", "type": "financial"},
        {"name": "ANSA English", "url": "https://www.ansa.it/english/", "type": "general"},
        {"name": "Reuters (Italy)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "The Local Italy", "url": "https://www.thelocal.it", "type": "general"},
    ],
    "GRC": [
        {"name": "Ekathimerini", "url": "https://www.ekathimerini.com", "type": "general"},
        {"name": "Athens News Agency", "url": "https://www.amna.gr/en/", "type": "general"},
        {"name": "Reuters (Greece)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Greek Reporter", "url": "https://greekreporter.com", "type": "general"},
    ],
    "MAR": [
        {"name": "Morocco World News", "url": "https://www.moroccoworldnews.com", "type": "general"},
        {"name": "TelQuel (EN)", "url": "https://telquel.ma/en/", "type": "general"},
        {"name": "Reuters (Morocco)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
        {"name": "Hespress English", "url": "https://en.hespress.com", "type": "general"},
    ],
    "KEN": [
        {"name": "Business Daily Africa", "url": "https://www.businessdailyafrica.com", "type": "financial"},
        {"name": "Nation Africa", "url": "https://nation.africa/kenya/", "type": "general"},
        {"name": "The Standard Kenya", "url": "https://www.standardmedia.co.ke", "type": "general"},
        {"name": "Reuters (Africa)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
    ],
    "ETH": [
        {"name": "Addis Fortune", "url": "https://addisfortune.news", "type": "financial"},
        {"name": "Ethiopian Reporter", "url": "https://www.thereporterethiopia.com", "type": "general"},
        {"name": "Reuters (Ethiopia)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
        {"name": "Fana Broadcasting", "url": "https://www.fanabc.com/english/", "type": "government"},
    ],
    "GHA": [
        {"name": "Graphic Online", "url": "https://www.graphic.com.gh", "type": "general"},
        {"name": "Ghana Business News", "url": "https://www.ghanabusinessnews.com", "type": "financial"},
        {"name": "Reuters (Ghana)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
        {"name": "Citifmonline", "url": "https://citifmonline.com", "type": "general"},
    ],
    "TZA": [
        {"name": "The Citizen Tanzania", "url": "https://www.thecitizen.co.tz", "type": "general"},
        {"name": "Daily News Tanzania", "url": "https://www.dailynews.co.tz", "type": "general"},
        {"name": "Reuters (Africa)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
        {"name": "Business Times TZ", "url": "https://www.businesstimes.co.tz", "type": "financial"},
    ],
}

# For countries without dedicated entries, generate regional fallback
REGIONAL_FALLBACKS = {
    "Europe & Central Asia": [
        {"name": "Reuters (Europe)", "url": "https://www.reuters.com/world/europe/", "type": "general"},
        {"name": "Euronews Business", "url": "https://www.euronews.com/next/", "type": "financial"},
        {"name": "Politico Europe", "url": "https://www.politico.eu", "type": "general"},
    ],
    "East Asia & Pacific": [
        {"name": "Reuters (Asia)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
        {"name": "Nikkei Asia", "url": "https://asia.nikkei.com", "type": "financial"},
        {"name": "Asia Times", "url": "https://asiatimes.com", "type": "general"},
    ],
    "South Asia": [
        {"name": "Reuters (Asia)", "url": "https://www.reuters.com/world/asia-pacific/", "type": "general"},
        {"name": "The Print", "url": "https://theprint.in", "type": "general"},
        {"name": "Asia Times", "url": "https://asiatimes.com", "type": "general"},
    ],
    "Latin America & Caribbean": [
        {"name": "Reuters (Latin America)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
        {"name": "Latin Finance", "url": "https://latinfinance.com", "type": "financial"},
        {"name": "Americas Quarterly", "url": "https://www.americasquarterly.org", "type": "general"},
    ],
    "Middle East & North Africa": [
        {"name": "Reuters (Middle East)", "url": "https://www.reuters.com/world/middle-east/", "type": "general"},
        {"name": "Al Jazeera English", "url": "https://www.aljazeera.com", "type": "general"},
        {"name": "MEED", "url": "https://www.meed.com", "type": "financial"},
    ],
    "Sub-Saharan Africa": [
        {"name": "Reuters (Africa)", "url": "https://www.reuters.com/world/africa/", "type": "general"},
        {"name": "AllAfrica", "url": "https://allafrica.com", "type": "general"},
        {"name": "African Business", "url": "https://african.business", "type": "financial"},
    ],
    "North America": [
        {"name": "Reuters (Americas)", "url": "https://www.reuters.com/world/americas/", "type": "general"},
        {"name": "Bloomberg", "url": "https://www.bloomberg.com", "type": "financial"},
        {"name": "Wall Street Journal", "url": "https://www.wsj.com", "type": "financial"},
    ],
}

print(f'Dedicated entries: {len(NEWS)} countries')

with open(OUTPUT, 'w') as f:
    json.dump(NEWS, f, indent=2)

size_kb = os.path.getsize(OUTPUT) / 1024
print(f'Saved to {OUTPUT} ({size_kb:.1f} KB)')

# Save regional fallbacks too
fallback_path = OUTPUT.replace('news_sources.json', 'news_regional.json')
with open(fallback_path, 'w') as f:
    json.dump(REGIONAL_FALLBACKS, f, indent=2)
print(f'Regional fallbacks saved to {fallback_path}')
