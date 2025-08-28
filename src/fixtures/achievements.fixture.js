// getting the current date
const date = new Date();


const initialAchievements = [
  {
    name: 'Fase 1 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase1Completed.webp',
    status: true,
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
    name: 'Fase 2 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase2Completed.webp',
    status: true,
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
    name: 'Fase 3 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase3Completed.webp',
    status: true,
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
    name: 'Fase 4 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase4Completed.webp',
    status: true,
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
    name: 'Fase 5 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase5Completed.webp',
    status: true,
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
    name: 'Fase 6 completada',
    imageUrl: 'https://hopedev.blob.core.windows.net/achievements/phase6Completed.webp',
    status: true,
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
]


module.exports = {initialAchievements};
