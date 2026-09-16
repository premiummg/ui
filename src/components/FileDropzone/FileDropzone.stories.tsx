import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { FilePill } from '../FilePill';

const meta: Meta<typeof FileDropzone> = {
  title: 'Components/FileDropzone',
  component: FileDropzone,
};
export default meta;

type Story = StoryObj<typeof FileDropzone>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <div className="space-y-3 max-w-sm">
          <FileDropzone onFiles={picked => setFiles(prev => [...prev, ...picked])} />
          {files.map((f, i) => (
            <FilePill key={i} name={f.name} onRemove={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
          ))}
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithSizeLimit: Story = {
  render: () => {
    function Demo() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <div className="space-y-3 max-w-sm">
          <FileDropzone
            onFiles={picked => setFiles(prev => [...prev, ...picked])}
            maxSizeMB={5}
            hint="PDF, images… up to 5MB each"
          />
          {files.map((f, i) => (
            <FilePill key={i} name={f.name} onRemove={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
          ))}
        </div>
      );
    }
    return <Demo />;
  },
};
