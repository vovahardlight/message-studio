import { CollectionConfig } from 'payload';

export const PagesSEO: CollectionConfig = {
  slug: 'pages-seo',
  admin: {
    useAsTitle: 'pageIdentifier',
  },
  fields: [
    {
      name: 'pageIdentifier',
      type: 'text',
      required: true,
      label: 'Идентификатор страницы (например: home-page)',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Мета-теги (Metadata)',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              localized: true,
              required: true,
              label: 'Meta Title (ES/EN)',
              admin: {
                description: 'Рекомендуемая длина: 50-60 символов',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              localized: true,
              required: true,
              label: 'Meta Description (ES/EN)',
              admin: {
                description: 'Рекомендуемая длина: 140-160 символов',
              },
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              label: 'Канонический URL (Canonical)',
            },
          ],
        },
        {
          label: 'Индексация (Robots)',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
              defaultValue: false,
              label: 'Закрыть от индексации (noindex)',
            },
            {
              name: 'noFollow',
              type: 'checkbox',
              defaultValue: false,
              label: 'Запретить переходы по ссылкам (nofollow)',
            },
          ],
        },
        {
          label: 'Open Graph (Превью WhatsApp/Соцсети)',
          fields: [
            {
              name: 'ogTitle',
              type: 'text',
              localized: true,
              label: 'OG Title',
            },
            {
              name: 'ogDescription',
              type: 'textarea',
              localized: true,
              label: 'OG Description',
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'OG Image (Рекомендуется 1200x630px)',
            },
          ],
        },
        {
          label: 'Schema.org (JSON-LD)',
          fields: [
            {
              name: 'customSchemaJson',
              type: 'code',
              admin: {
                language: 'json',
                description: 'Ручная вставка Schema.org микроразметки при необходимости',
              },
            },
          ],
        },
      ],
    },
  ],
};