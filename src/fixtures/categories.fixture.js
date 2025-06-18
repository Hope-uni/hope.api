
// get the current date
const date = new Date();

const categoryNames = {
  "animals": "Animales",
  "communication": "Comunicación",
  "document": "Documentos",
  "education": "Educación",
  "food": "Alimentos",
  "place": "Lugares",
  "plants": "Plantas",
  "sports": "Deportes",
  "time": "Tiempo",
  "vehicle": "Vehículos",
  "work": "Trabajo"
};

const initialCategories = [
  {
    name: 'Animales',
    icon: 'https://hopedev.blob.core.windows.net/category/animal.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Comunicación',
    icon: 'https://hopedev.blob.core.windows.net/category/communication.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Documentos',
    icon: 'https://hopedev.blob.core.windows.net/category/document.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Educación',
    icon: 'https://hopedev.blob.core.windows.net/category/education.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Alimentos',
    icon: 'https://hopedev.blob.core.windows.net/category/food.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Lugares',
    icon: 'https://hopedev.blob.core.windows.net/category/place.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Plantas',
    icon: 'https://hopedev.blob.core.windows.net/category/plants.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Deportes',
    icon: 'https://hopedev.blob.core.windows.net/category/sports.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Tiempo',
    icon: 'https://hopedev.blob.core.windows.net/category/time.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Vehículos',
    icon: 'https://hopedev.blob.core.windows.net/category/vehicle.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: 'Trabajo',
    icon: 'https://hopedev.blob.core.windows.net/category/work.webp',
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
];


module.exports = {initialCategories, categoryNames}
