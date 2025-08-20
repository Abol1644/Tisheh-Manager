export const cart1Details = {
  id: 1,
  number: '1',
  orderMan: 'آرین',
  broker: 'قاسمی',
};

export const accounts = [
  {
    id: 1,
    account: 'قاسمی',
    project: 'ماهان',
  },
  {
    id: 2,
    account: 'قاسمی',
    project: 'زردبند',
  }
];

export const shipments = [
  {
    accId: 1,
    items: [
      {
        id: 1,
        name: 'سیمان شمال',
        quantity: 2.56,
        unit: 'تن',
        pricePerUnite: 10000,
        price: 1200000,
        offPrice: 1000000
      },
      {
        id: 2,
        name: 'آجر فشاری',
        quantity: 1200,
        unit: 'قالب',
        pricePerUnite: 10000,
        price: 1200000,
        offPrice: 1000000
      },
    ]
  },
  {
    accId: 2,
    items: [
      {
        id: 1,
        name: 'سیمان تهران',
        quantity: 2.56,
        unit: 'تن',
        pricePerUnite: 10000,
        price: 1200000,
        offPrice: 1000000
      },
      {
        id: 2,
        name: 'آجر نما',
        quantity: 1200,
        unit: 'قالب',
        pricePerUnite: 10000,
        price: 1200000,
        // No offPrice for this item
      },
    ]
  }
]