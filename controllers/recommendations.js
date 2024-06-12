// controllers/recommendations.js

const recommendations = {
    'kardus': {
      rot: 'Kardus bisa diurai dengan proses komposting jika tidak terkontaminasi dengan bahan berbahaya.',
      refuse: 'Pilihlah untuk tidak menggunakan kemasan berlebihan atau beralih ke alternatif ramah lingkungan.',
      reduce: 'Belilah barang-barang dalam kemasan minimal atau kemasan yang dapat didaur ulang.',
      reuse: 'Gunakan kembali kardus untuk penyimpanan, pengiriman barang, atau proyek kerajinan.',
      repurpose: 'Manfaatkan kardus bekas sebagai bahan untuk membuat kerajinan atau bahkan sebagai pelapis di bawah taman.',
      recycle: 'Kumpulkan kardus bersih dan kering, lalu daur ulang melalui fasilitas daur ulang yang ada.'
    },
    'kaca': {
      rot: 'Kaca tidak bisa diurai, tetapi dapat dipecah menjadi serpihan kecil dan digunakan sebagai lapisan di bawah taman',
      refuse: 'Hindari menggunakan kemasan kaca sekali pakai dan pilihlah produk dalam kemasan yang dapat didaur ulang.',
      reduce: 'Belilah produk dalam kemasan besar atau hindari membeli produk yang dikemas dalam kaca jika memungkinkan',
      reuse: 'Gunakan kembali botol atau wadah kaca untuk penyimpanan atau dekorasi',
      repurpose: 'Ubah botol kaca menjadi lampu hias atau vas bunga',
      recycle: 'Pastikan untuk mendaur ulang kaca melalui program daur ulang yang ada atau fasilitas daur ulang kaca di daerah Anda'
    },
    'logam': {
      rot: 'Logam tidak dapat diurai, tetapi dapat didaur ulang untuk penggunaan berkelanjutan.',
      refuse: 'Pilihlah produk yang tidak dikemas dalam logam sekali pakai atau kemasan yang berlebihan.',
      reduce: 'Belilah produk dalam kemasan yang lebih besar atau kemasan yang dapat didaur ulang',
      reuse: 'Gunakan kembali logam bekas untuk membuat karya seni atau kerajinan tangan',
      repurpose: 'Ubah logam bekas menjadi barang-barang rumah tangga atau dekorasi',
      recycle: 'Daur ulang logam melalui program daur ulang komunitas atau fasilitas daur ulang logam'
    },
    'kertas': {
      rot: 'Kertas dapat diurai dalam komposter untuk menghasilkan humus yang berguna',
      refuse: 'Hindari mencetak atau menggunakan kertas jika tidak diperlukan, gunakan alternatif digital',
      reduce: 'Kurangi penggunaan kertas dengan mencetak dua sisi atau menggunakan kertas daur ulang.',
      reuse: 'Gunakan kembali kertas yang sudah tidak terpakai sebagai coretan atau sebagai bahan kemasan.',
      repurpose: 'Buatlah kertas bekas menjadi karya seni atau gunakan untuk membuat karya kerajinan tangan.',
      recycle: 'Pastikan untuk mendaur ulang kertas melalui program daur ulang komunitas atau fasilitas daur ulang yang tersedia'
    },
    'plastik': {
      rot: 'Plastik tidak bisa dirot, tetapi usahakan untuk memilih produk yang mudah terurai secara alami jika memungkinkan',
      refuse: 'Hindari penggunaan plastik sekali pakai. Gunakan tas belanja kain dan botol minum yang dapat diisi ulang',
      reduce: 'Kurangi penggunaan plastik dengan membeli produk dalam kemasan yang lebih besar atau beli dalam jumlah yang lebih besar',
      reuse: 'Gunakan kembali botol, wadah, dan kantong plastik untuk penyimpanan atau keperluan lain.',
      repurpose: 'Manfaatkan kreativitas Anda untuk mengubah botol plastik menjadi pot tanaman atau kerajinan tangan lainnya',
      recycle: 'Pisahkan plastik sesuai dengan jenisnya dan daur ulang melalui program daur ulang yang tersedia di daerah Anda.'
    },
    'organik': {
      rot: 'Organik bisa diuraikan melalui proses komposting menjadi pupuk yang berguna bagi tanaman.',
      refuse: 'Hindari pemborosan makanan dengan membeli hanya yang diperlukan dan menyimpan dengan bijaksana',
      reduce: 'Kurangi pemborosan makanan dengan merencanakan belanja dan menyimpan makanan dengan baik.',
      reuse: 'Gunakan kembali sisa-sisa makanan sebagai bahan untuk membuat kaldu atau saus',
      repurpose: 'Gunakan sisa-sisa makanan sebagai pakan ternak atau tambahan kompos',
      recycle: 'Organik dapat didaur ulang melalui kompos, baik di rumah maupun melalui fasilitas daur ulang komunitas'
    }
  };
  
  module.exports = recommendations;
  