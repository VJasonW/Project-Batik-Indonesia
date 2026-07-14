import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.batikMotif.deleteMany();
  await prisma.province.deleteMany();
  await prisma.adminUser.deleteMany();

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({
    data: {
      email: 'admin@batik.id',
      passwordHash,
    },
  });
  console.log('✅ Admin user created (admin@batik.id / admin123)');

  // Create all provinces (data from GeoJSON + additional known provinces)
  const provinces = [
    // Pulau Jawa (with batik data)
    { slug: 'dki-jakarta', name: 'DKI Jakarta', capital: 'Jakarta', region: 'Jawa', geoId: '31', shortDescription: 'Daerah Khusus Ibukota Jakarta adalah ibu kota negara Indonesia. Jakarta memiliki budaya Betawi yang kaya, termasuk batik khasnya.', accentColor: '#E67E22' },
    { slug: 'banten', name: 'Banten', capital: 'Serang', region: 'Jawa', geoId: '36', shortDescription: 'Provinsi Banten terletak di ujung barat Pulau Jawa. Banten memiliki warisan sejarah Kesultanan Banten yang kaya.', accentColor: '#9E7B4A' },
    { slug: 'jawa-barat', name: 'Jawa Barat', capital: 'Bandung', region: 'Jawa', geoId: '32', shortDescription: 'Jawa Barat dikenal dengan keindahan alam dan kekayaan budaya Sunda. Batik dari daerah ini memiliki ciri khas warna cerah dan motif megamendung.', accentColor: '#3B6B8C' },
    { slug: 'jawa-tengah', name: 'Jawa Tengah', capital: 'Semarang', region: 'Jawa', geoId: '33', shortDescription: 'Jawa Tengah merupakan salah satu pusat kebudayaan Jawa dan pusat batik tradisional Indonesia, khususnya kota Solo dan Pekalongan.', accentColor: '#6B4226' },
    { slug: 'di-yogyakarta', name: 'DI Yogyakarta', capital: 'Yogyakarta', region: 'Jawa', geoId: '34', shortDescription: 'Daerah Istimewa Yogyakarta dikenal sebagai pusat kebudayaan Jawa dan salah satu pusat batik tertua di Indonesia dengan motif keraton yang khas.', accentColor: '#8B5A2B' },
    { slug: 'jawa-timur', name: 'Jawa Timur', capital: 'Surabaya', region: 'Jawa', geoId: '35', shortDescription: 'Jawa Timur memiliki beragam batik khas dari berbagai daerah seperti Madura, Tuban, dan Pacitan dengan motif yang berani dan warna cerah.', accentColor: '#C0392B' },
    // Sumatera
    { slug: 'aceh', name: 'Aceh', capital: 'Banda Aceh', region: 'Sumatera', geoId: '11', shortDescription: 'Provinsi paling barat Indonesia dengan budaya Islam yang kuat.', accentColor: '#7F8C8D' },
    { slug: 'sumatera-utara', name: 'Sumatera Utara', capital: 'Medan', region: 'Sumatera', geoId: '12', shortDescription: 'Provinsi dengan keanekaragaman budaya Batak dan Melayu.', accentColor: '#7F8C8D' },
    { slug: 'sumatera-barat', name: 'Sumatera Barat', capital: 'Padang', region: 'Sumatera', geoId: '13', shortDescription: 'Tanah Minangkabau dengan budaya matrilineal yang unik.', accentColor: '#7F8C8D' },
    { slug: 'riau', name: 'Riau', capital: 'Pekanbaru', region: 'Sumatera', geoId: '14', shortDescription: 'Provinsi dengan budaya Melayu yang kental.', accentColor: '#7F8C8D' },
    { slug: 'jambi', name: 'Jambi', capital: 'Jambi', region: 'Sumatera', geoId: '15', shortDescription: 'Provinsi dengan warisan batik Jambi yang khas.', accentColor: '#7F8C8D' },
    { slug: 'sumatera-selatan', name: 'Sumatera Selatan', capital: 'Palembang', region: 'Sumatera', geoId: '16', shortDescription: 'Kota Palembang terkenal dengan songket dan batiknya.', accentColor: '#7F8C8D' },
    { slug: 'bengkulu', name: 'Bengkulu', capital: 'Bengkulu', region: 'Sumatera', geoId: '17', shortDescription: 'Provinsi di pesisir barat Sumatera dengan batik besurek.', accentColor: '#7F8C8D' },
    { slug: 'lampung', name: 'Lampung', capital: 'Bandar Lampung', region: 'Sumatera', geoId: '18', shortDescription: 'Provinsi di ujung selatan Sumatera.', accentColor: '#7F8C8D' },
    { slug: 'bangka-belitung', name: 'Kepulauan Bangka Belitung', capital: 'Pangkal Pinang', region: 'Sumatera', geoId: '19', shortDescription: 'Kepulauan timah dengan budaya Melayu.', accentColor: '#7F8C8D' },
    { slug: 'kepulauan-riau', name: 'Kepulauan Riau', capital: 'Tanjung Pinang', region: 'Sumatera', geoId: '21', shortDescription: 'Provinsi kepulauan di Selat Malaka.', accentColor: '#7F8C8D' },
    // Kalimantan
    { slug: 'kalimantan-barat', name: 'Kalimantan Barat', capital: 'Pontianak', region: 'Kalimantan', geoId: '61', shortDescription: 'Provinsi di barat Pulau Kalimantan.', accentColor: '#7F8C8D' },
    { slug: 'kalimantan-tengah', name: 'Kalimantan Tengah', capital: 'Palangka Raya', region: 'Kalimantan', geoId: '62', shortDescription: 'Provinsi di tengah Pulau Kalimantan.', accentColor: '#7F8C8D' },
    { slug: 'kalimantan-selatan', name: 'Kalimantan Selatan', capital: 'Banjarmasin', region: 'Kalimantan', geoId: '63', shortDescription: 'Provinsi di selatan Kalimantan dengan batik Sasirangan.', accentColor: '#7F8C8D' },
    { slug: 'kalimantan-timur', name: 'Kalimantan Timur', capital: 'Samarinda', region: 'Kalimantan', geoId: '64', shortDescription: 'Provinsi di timur Kalimantan.', accentColor: '#7F8C8D' },
    { slug: 'kalimantan-utara', name: 'Kalimantan Utara', capital: 'Tanjung Selor', region: 'Kalimantan', geoId: '65', shortDescription: 'Provinsi termuda di Kalimantan.', accentColor: '#7F8C8D' },
    // Sulawesi
    { slug: 'sulawesi-utara', name: 'Sulawesi Utara', capital: 'Manado', region: 'Sulawesi', geoId: '71', shortDescription: 'Provinsi di ujung utara Sulawesi.', accentColor: '#7F8C8D' },
    { slug: 'sulawesi-tengah', name: 'Sulawesi Tengah', capital: 'Palu', region: 'Sulawesi', geoId: '72', shortDescription: 'Provinsi di tengah Sulawesi.', accentColor: '#7F8C8D' },
    { slug: 'sulawesi-selatan', name: 'Sulawesi Selatan', capital: 'Makassar', region: 'Sulawesi', geoId: '73', shortDescription: 'Provinsi dengan budaya Bugis-Makassar.', accentColor: '#7F8C8D' },
    { slug: 'sulawesi-tenggara', name: 'Sulawesi Tenggara', capital: 'Kendari', region: 'Sulawesi', geoId: '74', shortDescription: 'Provinsi di tenggara Sulawesi.', accentColor: '#7F8C8D' },
    { slug: 'gorontalo', name: 'Gorontalo', capital: 'Gorontalo', region: 'Sulawesi', geoId: '75', shortDescription: 'Provinsi di utara Sulawesi.', accentColor: '#7F8C8D' },
    { slug: 'sulawesi-barat', name: 'Sulawesi Barat', capital: 'Mamuju', region: 'Sulawesi', geoId: '76', shortDescription: 'Provinsi di barat Sulawesi.', accentColor: '#7F8C8D' },
    // Bali & Nusa Tenggara
    { slug: 'bali', name: 'Bali', capital: 'Denpasar', region: 'Bali & Nusa Tenggara', geoId: '51', shortDescription: 'Pulau Dewata dengan budaya Hindu yang unik.', accentColor: '#2E8B7C' },
    { slug: 'nusa-tenggara-barat', name: 'Nusa Tenggara Barat', capital: 'Mataram', region: 'Bali & Nusa Tenggara', geoId: '52', shortDescription: 'Provinsi dengan budaya Sasak dan Sumbawa.', accentColor: '#7F8C8D' },
    { slug: 'nusa-tenggara-timur', name: 'Nusa Tenggara Timur', capital: 'Kupang', region: 'Bali & Nusa Tenggara', geoId: '53', shortDescription: 'Provinsi dengan kain tenun khas.', accentColor: '#7F8C8D' },
    // Maluku
    { slug: 'maluku', name: 'Maluku', capital: 'Ambon', region: 'Maluku', geoId: '81', shortDescription: 'Kepulauan rempah-rempah.', accentColor: '#7F8C8D' },
    { slug: 'maluku-utara', name: 'Maluku Utara', capital: 'Sofifi', region: 'Maluku', geoId: '82', shortDescription: 'Provinsi di utara Maluku.', accentColor: '#7F8C8D' },
    // Papua
    { slug: 'papua', name: 'Papua', capital: 'Jayapura', region: 'Papua', geoId: '91', shortDescription: 'Provinsi terbesar di Indonesia.', accentColor: '#7F8C8D' },
    { slug: 'papua-barat', name: 'Papua Barat', capital: 'Manokwari', region: 'Papua', geoId: '92', shortDescription: 'Provinsi di barat Pulau Papua.', accentColor: '#7F8C8D' },
    { slug: 'papua-selatan', name: 'Papua Selatan', capital: 'Merauke', region: 'Papua', geoId: '93', shortDescription: 'Provinsi baru di selatan Papua.', accentColor: '#7F8C8D' },
    { slug: 'papua-tengah', name: 'Papua Tengah', capital: 'Nabire', region: 'Papua', geoId: '94', shortDescription: 'Provinsi baru di tengah Papua.', accentColor: '#7F8C8D' },
    { slug: 'papua-pegunungan', name: 'Papua Pegunungan', capital: 'Jayawijaya', region: 'Papua', geoId: '95', shortDescription: 'Provinsi baru di pegunungan Papua.', accentColor: '#7F8C8D' },
    { slug: 'papua-barat-daya', name: 'Papua Barat Daya', capital: 'Sorong', region: 'Papua', geoId: '96', shortDescription: 'Provinsi baru di barat daya Papua.', accentColor: '#7F8C8D' },
  ];

  for (const prov of provinces) {
    await prisma.province.create({ data: prov });
  }
  console.log(`✅ ${provinces.length} provinces created`);

  // Create batik motifs for Jawa provinces
  const batikData: { provinceSlug: string; motifs: Array<{ name: string; shortSummary: string; history: string; meaning: string; originCity?: string }> }[] = [
    {
      provinceSlug: 'dki-jakarta',
      motifs: [
        {
          name: 'Batik Betawi',
          shortSummary: 'Batik khas Jakarta dengan motif ondel-ondel dan budaya Betawi',
          history: 'Batik Betawi berkembang sejak masa kolonial Belanda di Batavia. Motif ini terinspirasi dari kehidupan masyarakat Betawi, termasuk ondel-ondel, nusa kelapa, dan ornamen khas Betawi. Batik ini mengalami kebangkitan pada era 2000-an ketika pemerintah DKI Jakarta mendorong pelestarian budaya Betawi.',
          meaning: 'Motif ondel-ondel melambangkan pelindung dari roh jahat. Warna-warna cerah mencerminkan semangat dan keceriaan masyarakat Betawi. Motif nusa kelapa menggambarkan Jakarta sebagai kota yang dikelilingi kelapa.',
          originCity: 'Jakarta',
        },
      ],
    },
    {
      provinceSlug: 'banten',
      motifs: [
        {
          name: 'Batik Surosowan',
          shortSummary: 'Batik Banten dengan motif Keraton Surosowan',
          history: 'Batik Surosowan terinspirasi dari kebesaran Kesultanan Banten yang berpusat di Keraton Surosowan. Motif ini menggambarkan arsitektur dan ornamen keraton yang megah. Batik ini dikembangkan sebagai identitas budaya Banten setelah menjadi provinsi tersendiri pada tahun 2000.',
          meaning: 'Motif keraton melambangkan kejayaan dan keagungan Kesultanan Banten. Batik ini juga menjadi simbol kebangkitan budaya Banten dan kebanggaan masyarakat setempat terhadap warisan sejarahnya.',
          originCity: 'Serang',
        },
      ],
    },
    {
      provinceSlug: 'jawa-barat',
      motifs: [
        {
          name: 'Batik Megamendung',
          shortSummary: 'Batik ikonik Cirebon dengan motif awan berarak',
          history: 'Batik Megamendung berasal dari Cirebon dan dipengaruhi oleh budaya Tiongkok yang masuk melalui perdagangan maritim. Motif ini sudah ada sejak abad ke-14 dan menjadi salah satu motif batik paling terkenal di Indonesia. Pada tahun 2009, Batik Megamendung diakui UNESCO sebagai Warisan Budaya Tak Benda.',
          meaning: 'Motif awan (mega) yang mendung melambangkan kesabaran dan ketenangan. Tujuh lapisan warna biru dari terang ke gelap menggambarkan tujuh lapisan langit dalam kosmologi Jawa. Motif ini mengajarkan filosofi kesabaran menghadapi cobaan hidup.',
          originCity: 'Cirebon',
        },
        {
          name: 'Batik Garutan',
          shortSummary: 'Batik khas Garut dengan motif lereng dan warna alam',
          history: 'Batik Garutan berasal dari kota Garut di Jawa Barat. Tradisi membatik di Garut dimulai sejak abad ke-17 oleh para pendatang dari Jawa Tengah yang membawa teknik membatik. Batik Garutan dikenal dengan penggunaan pewarna alami dari tumbuhan lokal pegunungan Garut.',
          meaning: 'Motif lereng melambangkan kontur pegunungan Garut yang berlapis-lapis. Warna-warna alami menggambarkan keharmonisan manusia dengan alam. Batik ini menjadi simbol keindahan alam tatar Sunda.',
          originCity: 'Garut',
        },
        {
          name: 'Batik Ciamisan',
          shortSummary: 'Batik tradisional Ciamis dengan corak geometris',
          history: 'Batik Ciamisan merupakan batik tulis tradisional dari Kabupaten Ciamis yang sudah ada sejak masa Kerajaan Galuh. Batik ini dikenal dengan motif geometris dan flora fauna khas daerah Priangan Timur. Produksi batik Ciamis sempat menurun pada era modern namun kini sedang mengalami revitalisasi.',
          meaning: 'Motif geometris Batik Ciamisan melambangkan keteraturan alam semesta dan keseimbangan hidup menurut falsafah Sunda. Flora fauna yang digambarkan menunjukkan kekayaan hayati daerah Ciamis.',
          originCity: 'Ciamis',
        },
      ],
    },
    {
      provinceSlug: 'jawa-tengah',
      motifs: [
        {
          name: 'Batik Solo (Batik Keraton)',
          shortSummary: 'Batik klasik dari keraton Surakarta dengan warna sogan khas',
          history: 'Batik Solo merupakan salah satu batik tertua di Indonesia yang berasal dari tradisi Keraton Kasunanan Surakarta. Sejak abad ke-17, batik menjadi bagian integral dari kehidupan keraton, di mana setiap motif memiliki aturan ketat tentang siapa yang boleh mengenakannya. Kampung Laweyan dan Kauman di Solo dikenal sebagai sentra batik bersejarah.',
          meaning: 'Warna sogan (cokelat keemasan) melambangkan kesederhanaan dan keanggunan Jawa. Motif-motif keraton seperti Parang, Truntum, dan Sidomukti mengandung doa dan harapan untuk pemakainya, dari pernikahan hingga kehidupan sehari-hari.',
          originCity: 'Surakarta (Solo)',
        },
        {
          name: 'Batik Pekalongan',
          shortSummary: 'Batik pesisir dengan warna cerah dan motif flora',
          history: 'Batik Pekalongan berkembang di kota Pekalongan sejak abad ke-19. Karena letaknya di pesisir utara Jawa, batik ini mendapat pengaruh dari budaya Tionghoa, Arab, India, dan Eropa. Pekalongan dijuluki "Kota Batik" dan pada tahun 2014 ditetapkan UNESCO sebagai Kota Kreatif Dunia dalam bidang Crafts and Folk Art.',
          meaning: 'Warna-warna cerah dan motif bunga (buketan) mencerminkan keterbukaan masyarakat pesisir terhadap pengaruh luar. Motif Jlamprang yang terinspirasi dari kain patola India melambangkan kemakmuran dan keberuntungan.',
          originCity: 'Pekalongan',
        },
        {
          name: 'Batik Semarang',
          shortSummary: 'Batik akulturasi budaya Jawa dan Tionghoa',
          history: 'Batik Semarang berkembang di ibu kota Jawa Tengah sebagai perpaduan budaya Jawa, Tionghoa, dan Eropa. Kawasan Pecinan di Semarang menjadi salah satu pusat perkembangan batik ini. Motif khasnya menggambarkan landmark kota Semarang seperti Lawang Sewu, Tugu Muda, dan Sam Poo Kong.',
          meaning: 'Batik Semarang melambangkan keharmonisan hidup berdampingan berbagai etnis dan budaya. Motif Blekok (burung kuntul) melambangkan kelimpahan dan kesuburan tanah Semarang.',
          originCity: 'Semarang',
        },
      ],
    },
    {
      provinceSlug: 'di-yogyakarta',
      motifs: [
        {
          name: 'Batik Parang',
          shortSummary: 'Motif diagonal bergelombang simbol keberanian ksatria',
          history: 'Batik Parang adalah salah satu motif batik tertua yang berasal dari Keraton Yogyakarta. Menurut legenda, motif ini diciptakan oleh Sultan Agung Hanyokrokusumo pada abad ke-17 setelah bermeditasi di pantai selatan Jawa. Motif Parang dulunya hanya boleh dipakai oleh keluarga keraton, khususnya raja dan putra mahkota.',
          meaning: 'Motif Parang berasal dari kata "pereng" (lereng/tebing) yang melambangkan keteguhan hati dan semangat pantang menyerah. Bentuk huruf S yang berkesinambungan melambangkan kesinambungan kehidupan, air laut yang tak pernah berhenti bergerak, dan perjuangan yang tiada henti.',
          originCity: 'Yogyakarta',
        },
        {
          name: 'Batik Kawung',
          shortSummary: 'Motif geometris bulat lonjong melambangkan kesempurnaan',
          history: 'Batik Kawung merupakan motif batik klasik yang sudah ada sejak abad ke-13, ditemukan pada relief Candi Prambanan. Motif ini menggambarkan buah kolang-kaling (buah pohon aren/kawung) yang dipotong melintang. Sama seperti Parang, motif Kawung dulunya termasuk motif larangan yang hanya boleh dikenakan oleh keluarga keraton Yogyakarta.',
          meaning: 'Empat bulatan lonjong yang tersusun mengelilingi titik pusat melambangkan empat penjuru mata angin dan pusat alam semesta. Motif ini mengandung makna harapan agar pemakainya menjadi manusia yang berguna bagi sesama, sebagaimana pohon aren yang seluruh bagiannya bermanfaat.',
          originCity: 'Yogyakarta',
        },
      ],
    },
    {
      provinceSlug: 'jawa-timur',
      motifs: [
        {
          name: 'Batik Madura',
          shortSummary: 'Batik warna cerah dan berani khas Pulau Madura',
          history: 'Batik Madura berasal dari Pulau Madura dan sudah diproduksi sejak abad ke-16. Berbeda dengan batik Jawa yang cenderung berwarna gelap dan klasik, Batik Madura dikenal dengan warna-warna cerah dan berani seperti merah, kuning, dan hijau. Tiga daerah utama penghasil batik Madura adalah Bangkalan, Pamekasan, dan Sumenep.',
          meaning: 'Warna-warna cerah dan berani mencerminkan karakter masyarakat Madura yang tegas, berani, dan lugas. Motif tumbuhan dan hewan melambangkan kehidupan dan kesuburan alam Madura. Batik Madura juga mencerminkan semangat kemandirian wanita Madura yang umumnya membatik sebagai mata pencaharian.',
          originCity: 'Pamekasan',
        },
        {
          name: 'Batik Tuban',
          shortSummary: 'Batik gedog Tuban dengan teknik tenun tradisional',
          history: 'Batik Tuban atau Batik Gedog merupakan batik unik yang dihasilkan di atas kain tenun gedog (tenun tradisional dari kapas lokal). Tradisi ini sudah ada sejak masa Kerajaan Majapahit pada abad ke-14. Proses pembuatannya sangat panjang karena dimulai dari memintal benang, menenun kain, baru kemudian dibatik.',
          meaning: 'Batik Gedog Tuban melambangkan ketekunan dan kesabaran karena proses pembuatannya yang sangat panjang. Motif-motifnya yang sederhana namun kuat menggambarkan kehidupan agraris masyarakat Tuban. Batik ini juga menjadi simbol pelestarian tradisi tekstil pra-industri Indonesia.',
          originCity: 'Tuban',
        },
      ],
    },
  ];

  for (const { provinceSlug, motifs } of batikData) {
    const province = await prisma.province.findUnique({ where: { slug: provinceSlug } });
    if (!province) continue;

    for (const motif of motifs) {
      await prisma.batikMotif.create({
        data: {
          provinceId: province.id,
          name: motif.name,
          shortSummary: motif.shortSummary,
          history: motif.history,
          meaning: motif.meaning,
          originCity: motif.originCity || null,
          imageUrl: null,
        },
      });
    }
  }
  console.log('✅ Batik motifs seeded for Jawa provinces');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
