/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];
let editingTransactionId = null;

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
const generateUniqueId = () => +new Date();


/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');

const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitButton = transactionForm.querySelector('[data-testid="transactionFormSubmitButton"]');

const balanceAmountEl = document.querySelector('.tracker-summary__balance-amount');
const incomeAmountEl = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmountEl = document.querySelector('.tracker-summary__stat-amount--expense');

const searchInput = document.getElementById('searchTransactionFormTitleInput');
const searchForm = document.getElementById('searchTransactionForm');

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 * - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 * - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 * - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 * - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function renderTransactions(filterKeyword = '') {
  incomeList.innerHTML = '';
  expenseList.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => 
    transaction.title.toLowerCase().includes(filterKeyword.toLowerCase())
  );

  filteredTransactions.forEach(transaction => {
    const transactionCard = document.createElement('div');
    transactionCard.classList.add('tracker-transaction-item');
    transactionCard.setAttribute('data-testid', 'transactionItem');
    transactionCard.setAttribute('data-id', transaction.id);

    const typeSign = transaction.type === 'income' ? '+' : '-';
    const typeClass = transaction.type === 'income' ? 'income' : 'expense';
    const iconEmoji = transaction.type === 'income' ? '💰' : '💸';

    transactionCard.innerHTML = `
      <div class="tracker-transaction-item__icon tracker-transaction-item__icon--${typeClass}">
        ${iconEmoji}
      </div>
      <div class="tracker-transaction-item__detail">
        <h4 class="tracker-transaction-item__title" data-testid="transactionItemTitle">${transaction.title}</h4>
        <span class="tracker-transaction-item__date" data-testid="transactionItemDate">${transaction.date}</span>
      </div>
      <div class="tracker-transaction-item__right">
        <div class="tracker-transaction-item__amount tracker-transaction-item__amount--${typeClass}" data-testid="transactionItemAmount">
          ${typeSign} Rp ${transaction.amount.toLocaleString('id-ID')}
        </div>
        <div class="tracker-transaction-item__actions">
          <button class="tracker-transaction-item__btn btn-change-type" data-testid="transactionItemTypeButton">Ubah Tipe</button>
          <button class="tracker-transaction-item__btn btn-edit" data-testid="transactionItemEditButton">Edit</button>
          <button class="tracker-transaction-item__btn btn-delete" data-testid="transactionItemDeleteButton">Hapus</button>
        </div>
      </div>
    `;

    transactionCard.querySelector('.btn-change-type').addEventListener('click', () => {
      transaction.type = transaction.type === 'income' ? 'expense' : 'income';
      saveDataAndDispatch();
    });

    transactionCard.querySelector('.btn-edit').addEventListener('click', () => {
      editingTransactionId = transaction.id;
      titleInput.value = transaction.title;
      amountInput.value = transaction.amount;
      dateInput.value = transaction.date;
      typeSelect.value = transaction.type;
      submitButton.textContent = 'Perbarui';
      titleInput.focus();
    });

    transactionCard.querySelector('.btn-delete').addEventListener('click', () => {
      if (editingTransactionId === transaction.id) {
        resetForm();
      }
      transactions = transactions.filter(t => t.id !== transaction.id);
      saveDataAndDispatch();
    });

    if (transaction.type === 'income') {
      incomeList.appendChild(transactionCard);
    } else {
      expenseList.appendChild(transactionCard);
    }
  });
}

function saveDataAndDispatch() {
  localStorage.setItem('EXPENSE_TRACKER_DATA', JSON.stringify(transactions));
  document.dispatchEvent(new Event('transaction:updated'));
}

function resetForm() {
  editingTransactionId = null;
  transactionForm.reset();
  submitButton.textContent = 'Simpan';
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseInt(amountInput.value, 10);
  const date = dateInput.value;
  const type = typeSelect.value;

  /**
   * TODO [Skilled]:
   * Tambahkan validasi input sebelum menyimpan data:
   * - Tampilkan alert() dan hentikan proses jika judul kosong
   * - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
   */
  if (!title) {
    alert('Peringatan: Keterangan/Judul transaksi tidak boleh kosong!');
    return;
  }
  if (isNaN(amount) || amount < 1) {
    alert('Peringatan: Nominal transaksi harus berupa angka dan minimal bernilai 1!');
    return;
  }
  if (!date) {
    alert('Peringatan: Tanggal transaksi wajib diisi!');
    return;
  }

  if (editingTransactionId !== null) {
    const index = transactions.findIndex(t => t.id === editingTransactionId);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], title, amount, date, type };
    }
    resetForm();
  } else {
    const newTransaction = {
      id: generateUniqueId(),
      title,
      amount,
      date,
      type
    };
    transactions.push(newTransaction);
    transactionForm.reset();
  }

  saveDataAndDispatch();
});

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 * - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 * - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */
function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      totalExpense += transaction.amount;
    }
  });

  const totalBalance = totalIncome - totalExpense;

  balanceAmountEl.textContent = `Rp ${totalBalance.toLocaleString('id-ID')}`;
  incomeAmountEl.textContent = `Rp ${totalIncome.toLocaleString('id-ID')}`;
  expenseAmountEl.textContent = `Rp ${totalExpense.toLocaleString('id-ID')}`;
}


/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 * - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 * - Pengguna dapat mengubah data lalu menyimpan perubahan.
 * - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 * - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 * - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */
document.addEventListener('transaction:updated', () => {
  const currentKeyword = searchInput.value;
  renderTransactions(currentKeyword);
  updateDashboard();
});


/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 * - Saat diklik, ubah tipe transaksi: 'income' → 'expense' or 'expense' → 'income'
 * - Simpan perubahan ke localStorage dan perbarui tampilan
 */

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 * - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 * - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */
searchInput.addEventListener('input', (e) => {
  const keyword = e.target.value;
  renderTransactions(keyword);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  renderTransactions(searchInput.value);
});

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 * - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */
window.addEventListener('DOMContentLoaded', () => {
  const localData = localStorage.getItem('EXPENSE_TRACKER_DATA');
  if (localData) {
    transactions = JSON.parse(localData);
  }
  
  renderTransactions();
  updateDashboard();
});