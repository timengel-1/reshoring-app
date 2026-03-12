"""
Builds src/data/business_links.json

Three links per country (where available):
  1. us_embassy       — US Embassy in that country (commercial section)
  2. us_guide         — trade.gov Country Commercial Guide
  3. invest_agency    — Host country's invest promotion agency / ministry of commerce

US Embassy URLs follow the pattern: https://{iso2}.usembassy.gov
trade.gov guides: https://www.trade.gov/country-commercial-guides/{slug}
"""

import json, os

BASE     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(BASE, "src", "data", "business_links.json")

# ── ISO3 → ISO2 mapping ────────────────────────────────────────────────────────
ISO3_TO_ISO2 = {
    "AFG":"af","ALB":"al","DZA":"dz","AND":"ad","AGO":"ao","ARG":"ar","ARM":"am",
    "AUS":"au","AUT":"at","AZE":"az","BHS":"bs","BHR":"bh","BGD":"bd","BLR":"by",
    "BEL":"be","BLZ":"bz","BEN":"bj","BTN":"bt","BOL":"bo","BIH":"ba","BWA":"bw",
    "BRA":"br","BRN":"bn","BGR":"bg","BFA":"bf","BDI":"bi","KHM":"kh","CMR":"cm",
    "CAN":"ca","CPV":"cv","CAF":"cf","TCD":"td","CHL":"cl","CHN":"cn","COL":"co",
    "COM":"km","COD":"cd","COG":"cg","CRI":"cr","HRV":"hr","CUB":"cu","CYP":"cy",
    "CZE":"cz","DNK":"dk","DJI":"dj","DOM":"do","ECU":"ec","EGY":"eg","SLV":"sv",
    "GNQ":"gq","ERI":"er","EST":"ee","SWZ":"sz","ETH":"et","FJI":"fj","FIN":"fi",
    "FRA":"fr","GAB":"ga","GMB":"gm","GEO":"ge","DEU":"de","GHA":"gh","GRC":"gr",
    "GTM":"gt","GIN":"gn","GNB":"gw","GUY":"gy","HTI":"ht","HND":"hn","HUN":"hu",
    "ISL":"is","IND":"in","IDN":"id","IRN":"ir","IRQ":"iq","IRL":"ie","ISR":"il",
    "ITA":"it","JAM":"jm","JPN":"jp","JOR":"jo","KAZ":"kz","KEN":"ke","PRK":"kp",
    "KOR":"kr","KWT":"kw","KGZ":"kg","LAO":"la","LVA":"lv","LBN":"lb","LSO":"ls",
    "LBR":"lr","LBY":"ly","LIE":"li","LTU":"lt","LUX":"lu","MKD":"mk","MDG":"mg",
    "MWI":"mw","MYS":"my","MDV":"mv","MLI":"ml","MLT":"mt","MRT":"mr","MUS":"mu",
    "MEX":"mx","MDA":"md","MCO":"mc","MNG":"mn","MNE":"me","MAR":"ma","MOZ":"mz",
    "MMR":"mm","NAM":"na","NPL":"np","NLD":"nl","NZL":"nz","NIC":"ni","NER":"ne",
    "NGA":"ng","NOR":"no","OMN":"om","PAK":"pk","PAN":"pa","PNG":"pg","PRY":"py",
    "PER":"pe","PHL":"ph","POL":"pl","PRT":"pt","QAT":"qa","ROU":"ro","RUS":"ru",
    "RWA":"rw","SAU":"sa","SEN":"sn","SRB":"rs","SLE":"sl","SGP":"sg","SVK":"sk",
    "SVN":"si","SOM":"so","ZAF":"za","SSD":"ss","ESP":"es","LKA":"lk","SDN":"sd",
    "SUR":"sr","SWE":"se","CHE":"ch","SYR":"sy","TWN":"tw","TJK":"tj","TZA":"tz",
    "THA":"th","TLS":"tl","TGO":"tg","TTO":"tt","TUN":"tn","TUR":"tr","TKM":"tm",
    "UGA":"ug","UKR":"ua","ARE":"ae","GBR":"gb","USA":"us","URY":"uy","UZB":"uz",
    "VEN":"ve","VNM":"vn","YEM":"ye","ZMB":"zm","ZWE":"zw","HKG":"hk","MAC":"mo",
    "KSV":"xk","STP":"st","VUT":"vu","WSM":"ws","TON":"to","SLB":"sb","KIR":"ki",
    "FSM":"fm","PLW":"pw","MHL":"mh","NRU":"nr","TUV":"tv","CIV":"ci","GIN":"gn",
    "TTO":"tt","ATG":"ag","DMA":"dm","GRD":"gd","KNA":"kn","LCA":"lc","VCT":"vc",
    "BBD":"bb","MDV":"mv","MRT":"mr","MLT":"mt",
}

# ── Embassy URL exceptions (countries where iso2.usembassy.gov doesn't apply) ─
EMBASSY_OVERRIDES = {
    "TWN": "https://www.ait.org.tw",        # American Institute in Taiwan
    "PRK": None,                             # No US Embassy
    "IRN": None,                             # No US Embassy
    "CUB": "https://cu.usembassy.gov",
    "KSV": "https://xk.usembassy.gov",
    "HKG": "https://hk.usconsulate.gov",     # Consulate General
    "MAC": "https://hk.usconsulate.gov",     # Served by HK consulate
    "TWN": "https://www.ait.org.tw",
    "NRU": None,                             # No US Embassy
    "KIR": None,
    "TUV": None,
    "FSM": "https://fm.usembassy.gov",
    "PLW": "https://pw.usembassy.gov",
    "MHL": "https://mh.usembassy.gov",
    "TON": None,
    "WSM": None,
    "VUT": None,
    "SLB": None,
}

# ── trade.gov Country Commercial Guide slugs ──────────────────────────────────
# Pattern: https://www.trade.gov/country-commercial-guides/{slug}
TRADEGOV_SLUGS = {
    "AFG":"afghanistan","ALB":"albania","DZA":"algeria","AGO":"angola",
    "ARG":"argentina","ARM":"armenia","AUS":"australia","AUT":"austria",
    "AZE":"azerbaijan","BHR":"bahrain","BGD":"bangladesh","BEL":"belgium",
    "BLZ":"belize","BEN":"benin","BOL":"bolivia","BIH":"bosnia-and-herzegovina",
    "BWA":"botswana","BRA":"brazil","BRN":"brunei","BGR":"bulgaria",
    "BFA":"burkina-faso","KHM":"cambodia","CMR":"cameroon","CAN":"canada",
    "CPV":"cape-verde","TCD":"chad","CHL":"chile","CHN":"china","COL":"colombia",
    "COD":"democratic-republic-congo","COG":"republic-of-congo","CRI":"costa-rica",
    "HRV":"croatia","CYP":"cyprus","CZE":"czech-republic","DNK":"denmark",
    "DOM":"dominican-republic","ECU":"ecuador","EGY":"egypt","SLV":"el-salvador",
    "ETH":"ethiopia","FIN":"finland","FRA":"france","GAB":"gabon","GEO":"georgia",
    "DEU":"germany","GHA":"ghana","GRC":"greece","GTM":"guatemala","HND":"honduras",
    "HKG":"hong-kong","HUN":"hungary","ISL":"iceland","IND":"india","IDN":"indonesia",
    "IRQ":"iraq","IRL":"ireland","ISR":"israel","ITA":"italy","JAM":"jamaica",
    "JPN":"japan","JOR":"jordan","KAZ":"kazakhstan","KEN":"kenya","KSV":"kosovo",
    "KWT":"kuwait","KGZ":"kyrgyzstan","LAO":"laos","LVA":"latvia","LBN":"lebanon",
    "LBR":"liberia","LBY":"libya","LTU":"lithuania","LUX":"luxembourg",
    "MKD":"north-macedonia","MDG":"madagascar","MWI":"malawi","MYS":"malaysia",
    "MLT":"malta","MRT":"mauritania","MUS":"mauritius","MEX":"mexico","MDA":"moldova",
    "MNG":"mongolia","MNE":"montenegro","MAR":"morocco","MOZ":"mozambique",
    "MMR":"burma","NAM":"namibia","NPL":"nepal","NLD":"netherlands","NZL":"new-zealand",
    "NIC":"nicaragua","NGA":"nigeria","NOR":"norway","OMN":"oman","PAK":"pakistan",
    "PAN":"panama","PNG":"papua-new-guinea","PRY":"paraguay","PER":"peru",
    "PHL":"philippines","POL":"poland","PRT":"portugal","QAT":"qatar","ROU":"romania",
    "RUS":"russia","RWA":"rwanda","SAU":"saudi-arabia","SEN":"senegal","SRB":"serbia",
    "SLE":"sierra-leone","SGP":"singapore","SVK":"slovakia","SVN":"slovenia",
    "ZAF":"south-africa","SSD":"south-sudan","ESP":"spain","LKA":"sri-lanka",
    "SDN":"sudan","SWE":"sweden","CHE":"switzerland","SYR":"syria","TWN":"taiwan",
    "TJK":"tajikistan","TZA":"tanzania","THA":"thailand","TLS":"timor-leste",
    "TGO":"togo","TTO":"trinidad-and-tobago","TUN":"tunisia","TUR":"turkey",
    "TKM":"turkmenistan","UGA":"uganda","UKR":"ukraine","ARE":"united-arab-emirates",
    "GBR":"united-kingdom","URY":"uruguay","UZB":"uzbekistan","VEN":"venezuela",
    "VNM":"vietnam","YEM":"yemen","ZMB":"zambia","ZWE":"zimbabwe",
}

# ── Host country invest agencies / ministries of commerce ─────────────────────
# Format: [display_name, url]
INVEST_AGENCIES = {
    "AFG": ["Ministry of Commerce & Industries", "https://moci.gov.af"],
    "ALB": ["Albanian Investment Development Agency (AIDA)", "https://aida.gov.al"],
    "DZA": ["National Agency for Investment Development (ANDI)", "https://www.andi.dz"],
    "AGO": ["Angola Private Investment & Export Promotion Agency (AIPEX)", "https://aipex.gov.ao"],
    "ARG": ["Invest Argentina", "https://www.investinargentina.gob.ar"],
    "ARM": ["Enterprise Armenia", "https://enterprise.am"],
    "AUS": ["Australian Trade & Investment Commission (Austrade)", "https://www.austrade.gov.au"],
    "AUT": ["Austrian Business Agency (ABA)", "https://www.aba.gv.at/en"],
    "AZE": ["Azerbaijan Investment Company", "https://aic.az"],
    "BHS": ["Bahamas Investment Authority", "https://www.bahamas.gov.bs/bia"],
    "BHR": ["Bahrain Economic Development Board (EDB)", "https://bahrainedb.com"],
    "BGD": ["Bangladesh Investment Development Authority (BIDA)", "https://bida.gov.bd"],
    "BLR": ["National Agency of Investment & Privatization", "https://www.investinbelarus.by/en"],
    "BEL": ["Flanders Investment & Trade / Brussels Invest & Export", "https://www.flandersinvestmentandtrade.com"],
    "BLZ": ["Belize Investment Authority", "https://belizeinvest.org.bz"],
    "BEN": ["Agency for the Promotion of Investments & Exports (APIEX)", "https://www.apiex.bj"],
    "BTN": ["Department of Industry, Ministry of Industry, Commerce & Employment", "https://www.moice.gov.bt"],
    "BOL": ["Ministry of Productive Development & Plural Economy", "https://www.mpc.gob.bo"],
    "BIH": ["Foreign Investment Promotion Agency of BiH (FIPA)", "https://www.fipa.gov.ba"],
    "BWA": ["Botswana Investment & Trade Centre (BITC)", "https://www.bitc.co.bw"],
    "BRA": ["Apex-Brasil", "https://www.apexbrasil.com.br/en"],
    "BRN": ["Brunei Economic Development Board (BEDB)", "https://www.bedb.com.bn"],
    "BGR": ["InvestBulgaria Agency", "https://www.investbg.government.bg"],
    "BFA": ["Agency for Promotion of Investments in Burkina Faso", "https://www.apb.bf"],
    "BDI": ["API Burundi", "https://www.apibdi.bi"],
    "KHM": ["Council for the Development of Cambodia (CDC)", "https://www.cdc.gov.kh"],
    "CMR": ["Investment Promotion Agency of Cameroon (API)", "https://www.business.cm"],
    "CAN": ["Invest Canada", "https://www.investcanada.ca"],
    "CPV": ["Agency for Investment & Business Development (ADEI)", "https://www.adei.cv"],
    "CAF": ["Ministry of Commerce, Industry & SMEs", "https://www.gouvernement.cf"],
    "TCD": ["Agency for Promotion of Investments (APIJ)", "https://www.apijtchad.org"],
    "CHL": ["InvestChile", "https://investchile.gob.cl/en"],
    "CHN": ["Ministry of Commerce (MOFCOM)", "https://english.mofcom.gov.cn"],
    "COL": ["ProColombia", "https://procolombia.co/en"],
    "COM": ["Agency for the Promotion of Investments (API Comores)", "https://www.apicomores.com"],
    "COD": ["National Agency for Investment Promotion (ANAPI)", "https://www.anapi.cd"],
    "COG": ["Agency for Promotion of Investments (API Congo)", "https://www.api-congo.cg"],
    "CRI": ["Costa Rican Coalition for Development Initiatives (CINDE)", "https://www.cinde.org"],
    "HRV": ["Agency for Investments & Competitiveness (AIK)", "https://www.aik-invest.hr"],
    "CUB": ["Foreign Trade & Investment Ministry (MINCEX)", "http://www.mincex.gob.cu"],
    "CYP": ["Invest Cyprus", "https://www.investcyprus.org.cy"],
    "CZE": ["CzechInvest", "https://www.czechinvest.org/en"],
    "DNK": ["Invest in Denmark", "https://investindk.com"],
    "DJI": ["Djibouti Investment Promotion Agency (DIPA)", "https://www.agence.dj"],
    "DOM": ["Center for Export & Investment (CEI-RD)", "https://cei.gob.do"],
    "ECU": ["PRO ECUADOR", "https://www.proecuador.gob.ec"],
    "EGY": ["General Authority for Investment & Free Zones (GAFI)", "https://www.gafi.gov.eg"],
    "SLV": ["Ministry of Economy (MINEC)", "https://www.minec.gob.sv"],
    "GNQ": ["Ministry of Mines, Industry & Energy", "https://www.mmine.gob.gq"],
    "ERI": ["Eritrea Investment Center", "https://www.eic.gov.er"],
    "EST": ["Enterprise Estonia", "https://www.eas.ee/en"],
    "SWZ": ["Eswatini Investment Promotion Authority (EIPA)", "https://www.eipa.org.sz"],
    "ETH": ["Ethiopian Investment Commission (EIC)", "https://www.investethiopia.gov.et"],
    "FJI": ["Investment Fiji", "https://www.investmentfiji.org.fj"],
    "FIN": ["Business Finland", "https://www.businessfinland.fi/en"],
    "FRA": ["Business France", "https://www.businessfrance.fr/en"],
    "GAB": ["Agency for the Promotion of Investment in Gabon (ANPI)", "https://www.anpi-gabon.com"],
    "GMB": ["Gambia Investment & Export Promotion Agency (GIEPA)", "https://giepa.gm"],
    "GEO": ["Enterprise Georgia", "https://enterprisegeorgia.gov.ge"],
    "DEU": ["Germany Trade & Invest (GTAI)", "https://www.gtai.de/en"],
    "GHA": ["Ghana Investment Promotion Centre (GIPC)", "https://www.gipcghana.com"],
    "GRC": ["Enterprise Greece", "https://www.enterprisegreece.gov.gr"],
    "GTM": ["Invest in Guatemala (PRONACOM)", "https://investinguatemala.org"],
    "GIN": ["Agency for the Promotion of Private Investments (APIP)", "https://www.apip-guinee.com"],
    "GNB": ["Center for Investment Promotion (CPI)", "https://www.cpi.gw"],
    "GUY": ["Guyana Office for Investment (GO-Invest)", "https://www.goinvest.gov.gy"],
    "HTI": ["Center for Investment Facilitation (CFI)", "http://www.cfihaiti.net"],
    "HND": ["Honduras Investment Network (RED)", "https://www.invest.hn"],
    "HKG": ["InvestHK", "https://www.investhk.gov.hk"],
    "HUN": ["Hungarian Investment Promotion Agency (HIPA)", "https://hipa.hu/en"],
    "ISL": ["Invest in Iceland", "https://www.invest.is"],
    "IND": ["Invest India", "https://www.investindia.gov.in"],
    "IDN": ["Indonesia Investment Authority (INA)", "https://ina.go.id/en"],
    "IRQ": ["National Investment Commission (NIC Iraq)", "http://www.investpromo.gov.iq"],
    "IRL": ["IDA Ireland", "https://www.idaireland.com"],
    "ISR": ["Invest in Israel", "https://investinisrael.gov.il/en"],
    "ITA": ["ITA — Italian Trade Agency", "https://www.ice.it/en"],
    "JAM": ["Jamaica Promotions Corporation (JAMPRO)", "https://www.jampro.com"],
    "JPN": ["Japan External Trade Organization (JETRO)", "https://www.jetro.go.jp/en"],
    "JOR": ["Jordan Investment Commission (JIC)", "https://www.jic.gov.jo"],
    "KAZ": ["Kazakh Invest", "https://kazakstan-invest.gov.kz"],
    "KEN": ["Kenya Investment Authority (KenInvest)", "https://invest.go.ke"],
    "KSV": ["Kosovo Investment & Enterprise Support Agency (KIESA)", "https://kiesa.rks-gov.net"],
    "KOR": ["Invest Korea (KOTRA)", "https://www.investkorea.org"],
    "KWT": ["Kuwait Foreign Investment Bureau (KFIB)", "https://www.kfib.com.kw"],
    "KGZ": ["Investment Promotion Agency of Kyrgyzstan", "https://ipa.gov.kg"],
    "LAO": ["Investment Promotion Department (IPD)", "https://www.investlaos.gov.la"],
    "LVA": ["Investment & Development Agency of Latvia (LIAA)", "https://www.liaa.gov.lv/en"],
    "LBN": ["Investment Development Authority of Lebanon (IDAL)", "https://www.idal.com.lb"],
    "LSO": ["Lesotho National Development Corporation (LNDC)", "https://www.lndc.org.ls"],
    "LBR": ["National Investment Commission of Liberia (NIC)", "https://nic.gov.lr"],
    "LBY": ["Libyan Investment Authority", "https://lia.ly"],
    "LTU": ["Invest Lithuania", "https://www.investlithuania.com"],
    "LUX": ["Luxinnovation", "https://www.luxinnovation.lu"],
    "MAC": ["Macao Trade & Investment Promotion Institute (IPIM)", "https://www.ipim.gov.mo/en"],
    "MKD": ["Agency for Foreign Investments & Export Promotion (AFIEPM)", "https://www.investnorthmacedonia.gov.mk"],
    "MDG": ["Economic Development Board of Madagascar (EDBM)", "https://edbm.mg"],
    "MWI": ["Malawi Investment & Trade Centre (MITC)", "https://www.mitc.mw"],
    "MYS": ["Malaysian Investment Development Authority (MIDA)", "https://www.mida.gov.my"],
    "MDV": ["Ministry of Economic Development & Trade", "https://trade.gov.mv"],
    "MLI": ["Agency for Promotion of Investments in Mali (APIM)", "https://www.apim.ml"],
    "MLT": ["Malta Enterprise", "https://www.maltaenterprise.com"],
    "MRT": ["National Agency for Investment Promotion in Mauritania (ANIP)", "https://www.aniprim.mr"],
    "MUS": ["Economic Development Board Mauritius (EDB)", "https://edbmauritius.org"],
    "MEX": ["Secretariat of Economy", "https://www.gob.mx/se"],
    "MDA": ["Moldova Investment Agency (MIA)", "https://mia.md/en"],
    "MCO": ["Monaco Economic Board", "https://www.meb.mc"],
    "MNG": ["Invest Mongolia Agency", "https://investmongolia.gov.mn"],
    "MNE": ["Montenegro Investment Promotion Authority (MIPA)", "https://mipa.co.me"],
    "MAR": ["Moroccan Investment & Export Development Agency (AMDIE)", "https://amdie.gov.ma/en"],
    "MOZ": ["Agency for Investment & Business Facilitation (APIEX)", "https://www.apiex.gov.mz"],
    "MMR": ["Directorate of Investment & Company Administration (DICA)", "https://www.dica.gov.mm"],
    "NAM": ["Namibia Investment Promotion & Development Board (NIPDB)", "https://nipdb.com"],
    "NPL": ["Investment Board Nepal (IBN)", "https://ibn.gov.np"],
    "NLD": ["Netherlands Foreign Investment Agency (NFIA)", "https://investinholland.com"],
    "NZL": ["New Zealand Trade & Enterprise (NZTE)", "https://www.nzte.govt.nz"],
    "NIC": ["Nicaragua Investment Promotion Agency (ProNicaragua)", "https://pronicaragua.gob.ni"],
    "NER": ["Agency for Promotion of Investments in Niger (ANIPEX)", "https://www.anipex.ne"],
    "NGA": ["Nigerian Investment Promotion Commission (NIPC)", "https://www.nipc.gov.ng"],
    "NOR": ["Innovation Norway", "https://www.innovasjonnorge.no/en"],
    "OMN": ["Invest Easy — Ministry of Commerce, Industry & Investment Promotion", "https://www.investeasy.gov.om"],
    "PAK": ["Board of Investment Pakistan", "https://invest.gov.pk"],
    "PAN": ["Panama Investment Promotion Agency (ProPanamá)", "https://www.propanama.com"],
    "PNG": ["Investment Promotion Authority PNG (IPA)", "https://www.ipa.gov.pg"],
    "PRY": ["Network of Investment & Exports (Rediex)", "https://rediex.gov.py"],
    "PER": ["Private Investment Promotion Agency (ProInversión)", "https://www.proinversion.gob.pe"],
    "PHL": ["Board of Investments Philippines (BOI)", "https://boi.gov.ph"],
    "POL": ["Polish Investment & Trade Agency (PAIH)", "https://www.paih.gov.pl/en"],
    "PRT": ["AICEP Portugal Global", "https://www.portugalglobal.pt/en"],
    "QAT": ["Invest Qatar", "https://www.invest.qa"],
    "ROU": ["InvestRomania", "https://investromania.gov.ro/web"],
    "RUS": ["Russian Direct Investment Fund (RDIF)", "https://rdif.ru/eng"],
    "RWA": ["Rwanda Development Board (RDB)", "https://rdb.rw"],
    "SAU": ["Ministry of Investment Saudi Arabia (MISA)", "https://misa.gov.sa/en"],
    "SEN": ["Investment Promotion & Major Works Agency (APIX)", "https://www.apix.sn"],
    "SRB": ["Development Agency of Serbia (RAS)", "https://ras.gov.rs/en"],
    "SLE": ["Sierra Leone Investment & Export Promotion Agency (SLIEPA)", "https://sliepa.org"],
    "SGP": ["Singapore Economic Development Board (EDB)", "https://www.edb.gov.sg"],
    "SVK": ["Slovak Investment & Trade Development Agency (SARIO)", "https://www.sario.sk/en"],
    "SVN": ["Spirit Slovenia", "https://www.spirit.si/en"],
    "SOM": ["Somali Investment Promotion Office", "https://invest.gov.so"],
    "ZAF": ["InvestSA", "https://www.investsa.gov.za"],
    "SSD": ["South Sudan Investment Authority (SSIA)", "https://www.ssia.gov.ss"],
    "ESP": ["ICEX Invest in Spain", "https://www.investinspain.org"],
    "LKA": ["Board of Investment Sri Lanka (BOI)", "https://investsrilanka.com"],
    "SDN": ["Sudanese Investment Authority", "https://www.sudaneseinvestment.com"],
    "SUR": ["Suriname Investment & Trade Agency (InvestSur)", "https://www.investsur.com"],
    "SWE": ["Business Sweden", "https://www.business-sweden.com/en"],
    "CHE": ["Switzerland Global Enterprise (S-GE)", "https://www.s-ge.com/en"],
    "TWN": ["Invest Taiwan (MOEA)", "https://investtaiwan.nat.gov.tw/home?lang=en"],
    "TJK": ["State Committee on Investment & State Property Management", "https://invest.tj"],
    "TZA": ["Tanzania Investment Centre (TIC)", "https://www.tic.go.tz"],
    "THA": ["Thailand Board of Investment (BOI)", "https://www.boi.go.th/en"],
    "TLS": ["Trade & Investment Promotion (TradeInvest East Timor)", "https://www.mcie.gov.tl"],
    "TGO": ["Agency for Promotion of Investment & Free Zones (API)", "https://www.togoapi.tg"],
    "TTO": ["InvesTT", "https://www.investt.co.tt"],
    "TUN": ["Foreign Investment Promotion Agency (FIPA Tunisia)", "https://www.investintunisia.tn/en"],
    "TUR": ["Presidency of the Republic of Türkiye Investment Office", "https://www.invest.gov.tr/en"],
    "TKM": ["Ministry of Finance & Economy of Turkmenistan", "https://www.minfin.gov.tm"],
    "UGA": ["Uganda Investment Authority (UIA)", "https://www.ugandainvest.go.ug"],
    "UKR": ["UkraineInvest", "https://ukraineinvest.gov.ua/en"],
    "ARE": ["Abu Dhabi Investment Office (ADIO) / Dubai FDI", "https://adio.gov.ae"],
    "GBR": ["Department for Business & Trade (DBT)", "https://www.gov.uk/government/organisations/department-for-business-and-trade"],
    "USA": ["SelectUSA — US Dept of Commerce", "https://www.selectusa.gov"],
    "URY": ["Uruguay XXI", "https://www.uruguayxxi.gub.uy/en"],
    "UZB": ["Agency for Promotion of Investments (API Uzbekistan)", "https://invest.gov.uz/en"],
    "VEN": ["Ministry of Industries & National Production", "https://mippci.gob.ve"],
    "VNM": ["Foreign Investment Agency (FIA) — Ministry of Planning & Investment", "https://mpi.gov.vn/en"],
    "YEM": ["General Investment Authority of Yemen", "https://yeminvest.org"],
    "ZMB": ["Zambia Development Agency (ZDA)", "https://zda.org.zm"],
    "ZWE": ["Zimbabwe Investment & Development Agency (ZIDA)", "https://zida.gov.zw"],
    "CIV": ["Centre for Investment Promotion in Côte d'Ivoire (CEPICI)", "https://www.cepici.gouv.ci"],
    "VUT": ["Vanuatu Investment Promotion Authority (VIPA)", "https://vipa.gov.vu"],
    "SLB": ["Solomon Islands Investment Corporation", "https://www.commerce.gov.sb"],
    "WSM": ["Investment Samoa (SIFA)", "https://www.investsamoa.ws"],
    "TON": ["Tonga Development Bank / Business Tonga", "https://www.businesstonga.com"],
    "ATG": ["Antigua & Barbuda Investment Authority (ABIA)", "https://www.investantiguabarbuda.org"],
    "BRB": ["Invest Barbados", "https://investbarbados.org"],
    "DMA": ["Invest Dominica Authority (IDA)", "https://investdominica.dm"],
    "GRD": ["Grenada Industrial Development Corporation (GIDC)", "https://www.gidc.gd"],
    "LCA": ["Saint Lucia Investment Development Authority (SLINVEST)", "https://www.slinvest.org"],
    "VCT": ["Invest SVG", "https://www.investsvg.com"],
    "KNA": ["St. Kitts Investment Promotion Agency (SKIPA)", "https://www.skipa.kn"],
    "PRK": ["Korea National Economic Development Agency", None],
    "SYR": ["Syria Investment Agency", None],
    "IRN": ["Organization for Investment, Economic & Technical Assistance (OIETAI)", "https://investiniran.ir"],
    "LBY": ["Libya Investment Authority", "https://lia.ly"],
    "STP": ["Agência de Promoção de Investimentos de São Tomé e Príncipe", "https://api.st"],
    "NRU": ["Nauru Agency Corporation", None],
    "TUV": ["Tuvalu Commerce & Industry", None],
    "KIR": ["Ministry of Commerce & Industry, Kiribati", None],
    "FSM": ["FSM Department of Commerce, Resources & Development", "https://www.fsmgov.org"],
    "PLW": ["Palau Investment Authority", None],
    "MHL": ["Marshall Islands Development Bank", None],
}

# ── Build the output ───────────────────────────────────────────────────────────
output = {}

# Load countries.json to get country names (used for trade.gov slugs)
countries_path = os.path.join(BASE, "src", "data", "countries.json")
with open(countries_path) as f:
    countries = json.load(f)

name_map = {c["code"]: c["name"] for c in countries}

for code in set(list(ISO3_TO_ISO2.keys()) + list(INVEST_AGENCIES.keys())):
    entry = {}

    # US Embassy
    if code in EMBASSY_OVERRIDES:
        url = EMBASSY_OVERRIDES[code]
        if url:
            entry["us_embassy"] = {"name": "U.S. Embassy", "url": url}
    else:
        iso2 = ISO3_TO_ISO2.get(code, "").lower()
        if iso2:
            entry["us_embassy"] = {
                "name": "U.S. Embassy",
                "url": f"https://{iso2}.usembassy.gov"
            }

    # trade.gov Country Commercial Guide
    slug = TRADEGOV_SLUGS.get(code)
    if slug:
        country_name = name_map.get(code, code)
        entry["us_guide"] = {
            "name": f"{country_name} Commercial Guide",
            "url": f"https://www.trade.gov/country-commercial-guides/{slug}"
        }

    # Host country invest agency
    agency = INVEST_AGENCIES.get(code)
    if agency and agency[1]:
        entry["invest_agency"] = {"name": agency[0], "url": agency[1]}
    elif agency and not agency[1]:
        entry["invest_agency"] = {"name": agency[0], "url": None}

    if entry:
        output[code] = entry

with open(OUT_PATH, "w") as f:
    json.dump(output, f, indent=2)

print(f"✓ Built business_links.json — {len(output)} countries")
covered = sum(1 for v in output.values() if v.get("invest_agency") and v["invest_agency"].get("url"))
print(f"  {covered} countries have invest agency links")
guide_count = sum(1 for v in output.values() if v.get("us_guide"))
print(f"  {guide_count} countries have trade.gov commercial guides")
emb_count = sum(1 for v in output.values() if v.get("us_embassy"))
print(f"  {emb_count} countries have US Embassy links")
