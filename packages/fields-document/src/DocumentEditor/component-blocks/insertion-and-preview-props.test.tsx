/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Transforms, Editor } from 'slate';
import React from 'react';
import { jsx, makeEditor } from '../tests/utils';
import { component, fields } from '../../component-blocks';
import { createGetPreviewProps } from './preview-props';
import { insertComponentBlock } from '.';

const objectProp = fields.object({
  prop: fields.text({ label: 'Prop' }),
  block: fields.child({ kind: 'block', placeholder: '' }),
  inline: fields.child({ kind: 'inline', placeholder: '' }),
  many: fields.relationship({ label: 'Relationship', listKey: 'many', many: true }),
  select: fields.select({
    label: 'Select',
    defaultValue: 'a',
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
  }),
  conditional: fields.conditional(fields.checkbox({ label: 'Conditional' }), {
    true: fields.child({ kind: 'block', placeholder: '' }),
    false: fields.relationship({ label: 'Relationship', listKey: 'one' }),
  }),
  conditionalSelect: fields.conditional(
    fields.select({
      label: 'Conditional Select',
      defaultValue: 'a',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    } as const),
    {
      a: fields.text({ label: 'A in Conditional Select' }),
      b: fields.text({ label: 'B in Conditional Select', defaultValue: 'B' }),
    }
  ),
});

const componentBlocks = {
  void: component({
    component: () => null,
    label: 'Void',
    props: { text: fields.text({ label: 'Text' }) },
  }),
  complex: component({
    component: props => {
      return React.createElement(
        'div',
        null,
        props.fields.object.fields.block,
        props.fields.object.fields.inline,
        props.fields.object.fields.conditional.discriminant &&
          props.fields.object.fields.conditional.value
      );
    },
    label: 'Complex',
    props: {
      object: objectProp,
    },
  }),
};

test('inserting a void component block', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { componentBlocks }
  );
  insertComponentBlock(editor, componentBlocks, 'void');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="void"
        props={
          Object {
            "text": "",
          }
        }
      >
        <component-inline-prop>
          <text>
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('inserting a complex component block', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { componentBlocks }
  );
  insertComponentBlock(editor, componentBlocks, 'complex');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "block": undefined,
              "conditional": Object {
                "discriminant": false,
                "value": null,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "inline": undefined,
              "many": Array [],
              "prop": "",
              "select": "a",
            },
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
              "object",
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            Array [
              "object",
              "inline",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

const getPreviewProps = (editor: Editor) =>
  createGetPreviewProps({ kind: 'object', value: componentBlocks.complex.props }, props => {
    Transforms.setNodes(editor, { props }, { at: [0] });
  })((editor.children[0] as any).props);

const makeEditorWithComplexComponentBlock = () =>
  makeEditor(
    <editor>
      <component-block
        component="complex"
        props={{
          object: {
            conditional: {
              discriminant: false,
              value: null,
            },
            prop: '',
            select: 'a',
            conditionalSelect: {
              discriminant: 'a',
              value: '',
            },
            many: [],
          },
        }}
      >
        <component-block-prop propPath={['object', 'block']}>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['object', 'inline']}>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  );

test('preview props api', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  expect(previewProps).toMatchInlineSnapshot(`
    Object {
      "object": Object {
        "block": <block-prop />,
        "conditional": Object {
          "discriminant": false,
          "onChange": [Function],
          "options": undefined,
          "value": Object {
            "onChange": [Function],
            "value": null,
          },
        },
        "conditionalSelect": Object {
          "discriminant": "a",
          "onChange": [Function],
          "options": Array [
            Object {
              "label": "A",
              "value": "a",
            },
            Object {
              "label": "B",
              "value": "b",
            },
          ],
          "value": Object {
            "onChange": [Function],
            "options": undefined,
            "value": "",
          },
        },
        "inline": <inline-prop />,
        "many": Object {
          "onChange": [Function],
          "value": Array [],
        },
        "prop": Object {
          "onChange": [Function],
          "options": undefined,
          "value": "",
        },
        "select": Object {
          "onChange": [Function],
          "options": Array [
            Object {
              "label": "A",
              "value": "a",
            },
            Object {
              "label": "B",
              "value": "b",
            },
          ],
          "value": "a",
        },
      },
    }
  `);
});

test('preview props conditional change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.fields.object.fields.conditional.onChange(true);
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "conditional": Object {
                "discriminant": true,
                "value": undefined,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "many": Array [],
              "prop": "",
              "select": "a",
            },
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
              "object",
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            Array [
              "object",
              "inline",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
        <component-block-prop
          propPath={
            Array [
              "object",
              "conditional",
              "value",
            ]
          }
        >
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
  expect(getPreviewProps(editor).fields.object.fields.conditional).toMatchInlineSnapshot(`
    Object {
      "discriminant": true,
      "onChange": [Function],
      "options": undefined,
      "value": <conditional-prop />,
    }
  `);
});

test('preview props form change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.fields.object.fields.select.onChange('b');
  expect((editor.children[0] as any).props.object.fields.select).toBe('b');
  expect(getPreviewProps(editor).fields.object.fields.select.value).toBe('b');
});

test('relationship many change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  const val = [{ data: {}, id: 'some-id', label: 'some-id' }];
  previewProps.fields.object.fields.many.onChange(val);
  expect((editor.children[0] as any).props.object.fields.many).toEqual(val);
  expect(getPreviewProps(editor).fields.object.fields.many.value).toEqual(val);
});

function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('condition is false');
  }
}

test('relationship single change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.fields.object.fields.conditional.discriminant === false);
  const val = { data: {}, id: 'some-id', label: 'some-id' };
  previewProps.fields.object.fields.conditional.value.onChange(val);
  expect((editor.children[0] as any).props.object.fields.conditional.value).toEqual(val);
  expect((getPreviewProps(editor).fields.object.fields.conditional.value as any).value).toEqual(
    val
  );
});

test('changing conditional with form inside', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.fields.object.fields.conditional.discriminant === false);
  previewProps.fields.object.fields.conditionalSelect.onChange('b');

  expect((editor.children[0] as any).props.object.fields.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "b",
      "value": "B",
    }
  `);
  expect(getPreviewProps(editor).fields.object.fields.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "b",
      "onChange": [Function],
      "options": Array [
        Object {
          "label": "A",
          "value": "a",
        },
        Object {
          "label": "B",
          "value": "b",
        },
      ],
      "value": Object {
        "onChange": [Function],
        "options": undefined,
        "value": "B",
      },
    }
  `);
});

test('changing form inside conditional', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.fields.object.fields.conditional.discriminant === false);
  previewProps.fields.object.fields.conditionalSelect.value.onChange('Some content');

  expect((editor.children[0] as any).props.object.fields.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "a",
      "value": "Some content",
    }
  `);
  expect(getPreviewProps(editor).fields.object.fields.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "a",
      "onChange": [Function],
      "options": Array [
        Object {
          "label": "A",
          "value": "a",
        },
        Object {
          "label": "B",
          "value": "b",
        },
      ],
      "value": Object {
        "onChange": [Function],
        "options": undefined,
        "value": "Some content",
      },
    }
  `);
});
