import type { Meta, StoryObj } from '@storybook/react';
import { FiCheck } from 'react-icons/fi';
import { FormActions } from './FormActions';
import { Button } from '../Button';

const meta: Meta<typeof FormActions> = {
  title: 'Components/FormActions',
  component: FormActions,
  parameters: {
    docs: {
      description: {
        component:
          'The buttons of a form, at the bottom after the last field. The `PageHeader` band of a ' +
          'form page only announces the record: no Save or Submit up there.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FormActions>;

export const SaveAndCancel: Story = {
  render: () => (
    <FormActions>
      <Button variant="secondary">Cancel</Button>
      <Button type="submit"><FiCheck size={15} /> Save changes</Button>
    </FormActions>
  ),
};
