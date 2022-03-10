import { Stack } from '@keystone-ui/core';
import React, { useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { PreviewProps } from './api';
import { FormValueContentFromPreview, NonChildFieldComponentPropField } from './form-from-preview';

export function FormValue({
  onClose,
  props,
  isValid,
}: {
  props: PreviewProps<NonChildFieldComponentPropField>;
  onClose(): void;
  isValid: boolean;
}) {
  const [forceValidation, setForceValidation] = useState(false);

  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContentFromPreview {...props} forceValidation={forceValidation} />
      <KeystoneUIButton
        size="small"
        tone="active"
        weight="bold"
        onClick={() => {
          if (isValid) {
            onClose();
          } else {
            setForceValidation(true);
          }
        }}
      >
        Done
      </KeystoneUIButton>
    </Stack>
  );
}
