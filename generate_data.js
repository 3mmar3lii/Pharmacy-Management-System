const fs = require('fs');
const { faker } = require('@faker-js/faker');

const COUNT = 45;

const generateMedicines = () => {
    return Array.from({ length: COUNT }).map(() => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName() + ' ' + faker.helpers.arrayElement([100, 250, 500, 1000]) + 'mg',
        company: faker.company.name(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1500 })),
        stock: faker.number.int({ min: 0, max: 500 }),
        imageUrl: faker.image.urlLoremFlickr({ category: 'pill' })
    }));
};

const generateInvoices = () => {
    const statuses = ['Paid', 'Pending', 'Cancelled', 'Refunded'];
    return Array.from({ length: COUNT }).map(() => ({
        id: faker.string.uuid(),
        customerName: faker.person.fullName(),
        total: parseFloat(faker.commerce.price({ min: 50, max: 5000 })),
        date: faker.date.recent({ days: 30 }).toISOString(),
        status: faker.helpers.arrayElement(statuses)
    }));
};

const generateCategories = () => {
    return Array.from({ length: COUNT }).map(() => ({
        id: faker.string.uuid(),
        nameEn: faker.commerce.department(),
        nameAr: "قسم " + faker.commerce.department(),
        description: faker.lorem.sentence()
    }));
};

const generateSubCategories = (categories) => {
    return Array.from({ length: COUNT }).map(() => ({
        id: faker.string.uuid(),
        nameEn: faker.commerce.productAdjective() + " " + faker.commerce.productMaterial(),
        nameAr: "فرع " + faker.string.alpha(5),
        categoryId: faker.helpers.arrayElement(categories).id
    }));
};

const generateSuppliers = () => {
    return Array.from({ length: COUNT }).map(() => ({
        id: faker.string.uuid(),
        name: faker.company.name(),
        contact: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress()
    }));
};

const categories = generateCategories();
fs.writeFileSync('categories.json', JSON.stringify(categories, null, 2));

const subcategories = generateSubCategories(categories);
fs.writeFileSync('subcategories.json', JSON.stringify(subcategories, null, 2));

const medicines = generateMedicines();
fs.writeFileSync('medicines.json', JSON.stringify(medicines, null, 2));

const invoices = generateInvoices();
fs.writeFileSync('invoices.json', JSON.stringify(invoices, null, 2));

const suppliers = generateSuppliers();
fs.writeFileSync('suppliers.json', JSON.stringify(suppliers, null, 2));

console.log('Successfully generated JSON files: medicines.json, suppliers.json, invoices.json, categories.json, subcategories.json');
