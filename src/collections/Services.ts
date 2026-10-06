import { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'duration', 'order'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true, // Независимо для ES и EN
      label: 'Название массажа (Nombre / Service Name)',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Цена в EUR (€)',
      admin: {
        description: 'Мастер может изменить цену в любой момент',
      },
    },
    {
      name: 'duration',
      type: 'select',
      required: true,
      options: [
        { label: '45 min', value: '45' },
        { label: '60 min', value: '60' },
        { label: '90 min', value: '90' },
        { label: '120 min', value: '120' },
      ],
      label: 'Длительность (Duración)',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Описание процедуры (Для клиента и SEO)',
    },
    {
      name: 'freshaLink',
      type: 'text',
      required: true,
      label: 'Прямая ссылка на бронь в Fresha (Direct link)',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Порядок вывода карточки',
    },
  ],
};