const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const xlsx = require('xlsx'); // Thư viện để làm việc với file Excel

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// Đọc dữ liệu từ sheet trong file Excel
const loadDataFromExcel = (filename, sheetName) => {
    const filePath = `./data/${filename}.xlsx`;
    if (!fs.existsSync(filePath)) {
        return []; // Nếu file không tồn tại, trả về mảng rỗng
    }
    const workbook = xlsx.readFile(filePath);
    if (!workbook.SheetNames.includes(sheetName)) {
        return []; // Nếu sheet không tồn tại, trả về mảng rỗng
    }
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Chuyển sheet thành mảng dữ liệu
    return data;
};

// Lưu dữ liệu vào sheet trong file Excel
const saveDataToExcel = (data, filename, sheetName) => {
    const filePath = `./data/${filename}.xlsx`;
    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath); // Đọc file đã có
    } else {
        workbook = xlsx.utils.book_new(); // Tạo mới nếu chưa có
    }

    const ws = xlsx.utils.aoa_to_sheet(data); // Chuyển mảng dữ liệu thành sheet
    if (workbook.SheetNames.includes(sheetName)) {
        workbook.Sheets[sheetName] = ws; // Cập nhật sheet nếu đã tồn tại
    } else {
        xlsx.utils.book_append_sheet(workbook, ws, sheetName); // Thêm sheet mới
    }

    xlsx.writeFile(workbook, filePath); // Lưu lại file
};

// Lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    const products = loadDataFromExcel('data', 'products');
    res.json(products);
});

// Thêm sản phẩm mới
app.post('/api/products', (req, res) => {
    const { Product_name, Price, Quantity } = req.body;

    if (!Product_name || !Price || !Quantity) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm!' });
    }

    const newProduct = {
        Product_id: uuidv4(),
        Product_name,
        Price: parseFloat(Price),
        Quantity: parseInt(Quantity, 10),
    };

    const products = loadDataFromExcel('data', 'products');
    products.push([newProduct.Product_id, newProduct.Product_name, newProduct.Price, newProduct.Quantity]);
    saveDataToExcel(products, 'data', 'products');

    res.status(201).json(newProduct);
});

// Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const products = loadDataFromExcel('data', 'products');
    const index = products.findIndex(product => product[0] === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }

    products.splice(index, 1);
    saveDataToExcel(products, 'data', 'products');

    res.json({ message: 'Xóa sản phẩm thành công!' });
});

// Chỉnh sửa sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { Product_name, Price, Quantity } = req.body;
    const products = loadDataFromExcel('data', 'products');

    const product = products.find(product => product[0] === id);

    if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }

    if (Product_name) product[1] = Product_name;
    if (Price) product[2] = parseFloat(Price);
    if (Quantity) product[3] = parseInt(Quantity, 10);

    saveDataToExcel(products, 'data', 'products');

    res.json({ message: 'Cập nhật sản phẩm thành công!', product });
});

// Bán sản phẩm
app.post('/api/products/sell/:id', (req, res) => {
    const { id } = req.params;
    const { Quantity } = req.body;
    const products = loadDataFromExcel('data', 'products');

    const product = products.find(product => product[0] === id);

    if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }

    const sellQuantity = parseInt(Quantity, 10);

    if (product[3] < sellQuantity) {
        return res.status(400).json({ message: 'Không đủ số lượng để bán!' });
    }

    product[3] -= sellQuantity;

    const transaction = {
        Product_name: product[1],
        Quantity: sellQuantity,
        Total_price: sellQuantity * product[2],
        Date: new Date().toISOString(),
    };

    saveDataToExcel(products, 'data', 'products');

    res.json(transaction);
});

// Lấy danh sách warehouse
app.get('/api/warehouses', (req, res) => {
    const warehouses = loadDataFromExcel('data', 'warehouses');
    res.json(warehouses);
});

// Thêm warehouse mới
app.post('/api/warehouses', (req, res) => {
    const { Warehouse_name, Location, Capacity } = req.body;

    if (!Warehouse_name || !Location || !Capacity) {
        return res.status(400).json({ message: 'Thiếu thông tin kho hàng!' });
    }

    const newWarehouse = {
        Warehouse_id: uuidv4(),
        Warehouse_name,
        Location,
        Capacity: parseInt(Capacity, 10),
    };

    const warehouses = loadDataFromExcel('data', 'warehouses');
    warehouses.push([newWarehouse.Warehouse_id, newWarehouse.Warehouse_name, newWarehouse.Location, newWarehouse.Capacity]);
    saveDataToExcel(warehouses, 'data', 'warehouses');

    res.status(201).json(newWarehouse);
});

// Xóa warehouse
app.delete('/api/warehouses/:id', (req, res) => {
    const { id } = req.params;
    const warehouses = loadDataFromExcel('data', 'warehouses');
    const index = warehouses.findIndex(warehouse => warehouse[0] === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Không tìm thấy kho hàng!' });
    }

    warehouses.splice(index, 1);
    saveDataToExcel(warehouses, 'data', 'warehouses');

    res.json({ message: 'Xóa kho hàng thành công!' });
});

// Chỉnh sửa warehouse
app.put('/api/warehouses/:id', (req, res) => {
    const { id } = req.params;
    const { Warehouse_name, Location, Capacity } = req.body;
    const warehouses = loadDataFromExcel('data', 'warehouses');

    const warehouse = warehouses.find(warehouse => warehouse[0] === id);

    if (!warehouse) {
        return res.status(404).json({ message: 'Không tìm thấy kho hàng!' });
    }

    if (Warehouse_name) warehouse[1] = Warehouse_name;
    if (Location) warehouse[2] = Location;
    if (Capacity) warehouse[3] = parseInt(Capacity, 10);

    saveDataToExcel(warehouses, 'data', 'warehouses');

    res.json({ message: 'Cập nhật kho hàng thành công!', warehouse });
});

// Server lắng nghe (chỉ để sử dụng API cục bộ, không chia sẻ ngoài)
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
