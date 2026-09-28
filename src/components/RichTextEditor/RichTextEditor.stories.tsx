import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { RichTextContent } from './RichTextContent';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/RichTextEditor',
  component: RichTextEditor,
};
export default meta;

type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return <RichTextEditor value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const WithContent: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(
        '<div>Formatted text, a <b>bold</b> word, an <i>italic</i> one, and a bullet list:</div><ul><li>Paste a screenshot with Ctrl+V</li><li>Insert a YouTube video from the toolbar</li></ul>',
      );
      return <RichTextEditor value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

// RichTextContent is this editor's read-only counterpart - same relationship
// as AuthShell/AuthError above, so it's demoed alongside its editor rather
// than getting a separate top-level catalog entry of its own.
export const EditorAndPreview: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(
        '<div>Edit on the left, the <b>sanitized read-only render</b> updates live on the right.</div>',
      );
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RichTextEditor value={value} onChange={setValue} />
          <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
            <RichTextContent html={value} />
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};
