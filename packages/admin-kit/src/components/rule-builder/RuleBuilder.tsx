import { type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button.js';
import { Input } from '../../ui/input.js';
import { MultiSelect } from '../../ui/multi-select.js';
import { Select } from '../../ui/select.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import type { PromotionRule } from '@endora-commerce/contracts';

/**
 * Feature 045 — generic, controlled rule builder for a typed rule AST
 * (`all` | `condition` | `group`). Extracted as a shared admin component so it
 * can be reused beyond promotions.
 *
 * Feature 067 made the **built-in field catalogue a prop**. It was hard-coded
 * to the promotion cart context (`cartTotal`, `paymentMethod`, …), which the
 * product feed criteria panel cannot use: its criteria are about products, not
 * carts. Forking the file would have made this the admin's *third* rule builder
 * and forked its accessibility and bug fixes with it (Principle IX).
 *
 * Issue #1433 (DS-16, SHELL-07) moved every word the component draws itself
 * into the `core` bundle. Every entry of {@link RuleBuilderLabels} still
 * overrides its default.
 */
export interface RuleAttributeField {
  attributeKey: string;
  label: string;
}

export type StructuralRuleField =
  | { kind: 'builtin'; key: string }
  | { kind: 'attribute'; attributeKey: string }
  | { kind: 'customField'; fieldKey: string };

export type StructuralRuleValue = string | number | boolean;

export interface StructuralRuleCondition {
  kind: 'condition';
  field: StructuralRuleField;
  op: string;
  values: StructuralRuleValue[];
}

export type StructuralRule =
  | { kind: 'all' }
  | StructuralRuleCondition
  | { kind: 'group'; op: 'AND' | 'OR'; children: StructuralRule[] };

export interface RuleBuilderBuiltinField {
  key: string;
  kind: 'number' | 'string' | 'set';
  ops: string[];
  label?: string;
  seed?: { op: string; values: StructuralRuleValue[] };
}

export interface RuleBuilderLabels {
  builtinGroup?: string;
  attributeGroup?: string;
  matchAll?: string;
  valuesPlaceholder?: string;
  valuesLabel?: string;
  valuesSearchPlaceholder?: string;
  valuesInputPlaceholder?: string;
  fieldLabel?: string;
  operatorLabel?: string;
  addCondition?: string;
  addGroup?: string;
  combineWith?: string;
  groupOperatorLabel?: string;
  groupAll?: string;
  groupAny?: string;
  groupSuffix?: string;
  addChildCondition?: string;
  addChildGroup?: string;
  removeCondition?: string;
  removeChild?: string;
}

const BUILTIN_FIELDS: RuleBuilderBuiltinField[] = [
  {
    key: 'cartTotal',
    kind: 'number',
    ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
    seed: { op: 'gte', values: [0] },
  },
  { key: 'paymentMethod', kind: 'string', ops: ['eq', 'neq', 'in', 'notIn'] },
  { key: 'deliveryMethod', kind: 'string', ops: ['eq', 'neq', 'in', 'notIn'] },
  { key: 'deliveryCountry', kind: 'string', ops: ['eq', 'neq', 'in', 'notIn'] },
  { key: 'deliveryPostalCode', kind: 'string', ops: ['eq', 'neq', 'contains', 'startsWith'] },
  { key: 'organization', kind: 'string', ops: ['eq', 'neq', 'in', 'notIn'] },
  { key: 'customerGroup', kind: 'string', ops: ['eq', 'neq', 'in', 'notIn'] },
  { key: 'category', kind: 'set', ops: ['in', 'notIn'] },
];

const DEFAULT_LABEL_KEYS: Readonly<Record<keyof RuleBuilderLabels, string>> = {
  builtinGroup: 'ruleBuilder.group.builtin',
  attributeGroup: 'ruleBuilder.group.attribute',
  matchAll: 'ruleBuilder.matchAll',
  valuesPlaceholder: 'ruleBuilder.values.placeholder',
  valuesLabel: 'ruleBuilder.values.label',
  valuesSearchPlaceholder: 'ruleBuilder.values.search',
  valuesInputPlaceholder: 'ruleBuilder.values.input',
  fieldLabel: 'ruleBuilder.field.label',
  operatorLabel: 'ruleBuilder.operator.label',
  addCondition: 'ruleBuilder.add.condition',
  addGroup: 'ruleBuilder.add.group',
  combineWith: 'ruleBuilder.combineWith',
  groupOperatorLabel: 'ruleBuilder.groupOp.label',
  groupAll: 'ruleBuilder.groupOp.all',
  groupAny: 'ruleBuilder.groupOp.any',
  groupSuffix: 'ruleBuilder.groupOp.suffix',
  addChildCondition: 'ruleBuilder.add.childCondition',
  addChildGroup: 'ruleBuilder.add.childGroup',
  removeCondition: 'ruleBuilder.remove.condition',
  removeChild: 'ruleBuilder.remove.child',
};

const ATTRIBUTE_OPS: string[] = ['eq', 'neq', 'in', 'notIn', 'between'];

function defaultCondition(fields: RuleBuilderBuiltinField[]): StructuralRuleCondition {
  const first = fields[0];
  if (!first) return { kind: 'condition', field: { kind: 'attribute', attributeKey: '' }, op: 'eq', values: [] };
  return {
    kind: 'condition',
    field: { kind: 'builtin', key: first.key },
    op: first.seed?.op ?? first.ops[0] ?? 'eq',
    values: first.seed?.values ?? [],
  };
}

function fieldKey(field: StructuralRuleField): string {
  if (field.kind === 'builtin') return `builtin:${field.key}`;
  if (field.kind === 'attribute') return `attribute:${field.attributeKey}`;
  return `attribute:${field.fieldKey}`;
}

function builtinDef(
  field: StructuralRuleField,
  fields: RuleBuilderBuiltinField[],
): RuleBuilderBuiltinField | null {
  if (field.kind !== 'builtin') return null;
  return fields.find((f) => f.key === field.key) ?? null;
}

function opsForField(field: StructuralRuleField, fields: RuleBuilderBuiltinField[]): string[] {
  const def = builtinDef(field, fields);
  return def ? def.ops : ATTRIBUTE_OPS;
}

function isNumericField(field: StructuralRuleField, fields: RuleBuilderBuiltinField[]): boolean {
  return builtinDef(field, fields)?.kind === 'number';
}

function valuesToText(values: ReadonlyArray<StructuralRuleValue>): string {
  return values.map((v) => String(v)).join(', ');
}

function textToValues(text: string, numeric: boolean): Array<string | number> {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (numeric ? Number(s) : s));
}

function catalogLabel(
  t: (key: string) => string,
  key: string,
  fallback: string,
): string {
  const value = t(key);
  return value === `core.${key}` ? fallback : value;
}

export type RuleFieldOptions = Partial<Record<string, Array<{ value: string; label: string }>>>;

export interface RuleBuilderProps<T extends StructuralRule = PromotionRule> {
  value: T;
  onChange: (next: T) => void;
  builtinFields?: RuleBuilderBuiltinField[];
  attributeFields?: RuleAttributeField[];
  fieldOptions?: RuleFieldOptions;
  labels?: RuleBuilderLabels;
  disabled?: boolean;
}

export function RuleBuilder<T extends StructuralRule = PromotionRule>({
  value,
  onChange,
  builtinFields = BUILTIN_FIELDS,
  attributeFields = [],
  fieldOptions = {},
  labels,
  disabled = false,
}: RuleBuilderProps<T>): ReactNode {
  const t = useTranslation('core');
  const copy = Object.fromEntries(
    (Object.keys(DEFAULT_LABEL_KEYS) as Array<keyof RuleBuilderLabels>).map((name) => [
      name,
      labels?.[name] ?? t(DEFAULT_LABEL_KEYS[name]),
    ]),
  ) as Required<RuleBuilderLabels>;
  return (
    <div className="rounded-md border border-line p-3" data-slot="rule-builder">
      <RuleNode
        node={value}
        onChange={(next): void => onChange(next as T)}
        builtinFields={builtinFields}
        attributeFields={attributeFields}
        fieldOptions={fieldOptions}
        labels={copy}
        disabled={disabled}
        depth={0}
        t={t}
      />
    </div>
  );
}

function RuleNode({
  node,
  onChange,
  builtinFields,
  attributeFields,
  fieldOptions,
  labels,
  disabled,
  depth,
  t,
}: {
  node: StructuralRule;
  onChange: (next: StructuralRule) => void;
  builtinFields: RuleBuilderBuiltinField[];
  attributeFields: RuleAttributeField[];
  fieldOptions: RuleFieldOptions;
  labels: Required<RuleBuilderLabels>;
  disabled: boolean;
  depth: number;
  t: (key: string) => string;
}): ReactNode {
  if (node.kind === 'all') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{labels.matchAll}</span>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onChange(defaultCondition(builtinFields))}>
          <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> {labels.addCondition}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            onChange({ kind: 'group', op: 'AND', children: [defaultCondition(builtinFields)] })
          }
        >
          <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> {labels.addGroup}
        </Button>
      </div>
    );
  }

  if (node.kind === 'condition') {
    return (
      <div className="flex flex-col gap-2">
        <ConditionRow
          condition={node}
          onChange={onChange}
          builtinFields={builtinFields}
          attributeFields={attributeFields}
          fieldOptions={fieldOptions}
          labels={labels}
          disabled={disabled}
          onRemove={() => onChange({ kind: 'all' })}
          t={t}
        />
        <div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() =>
              onChange({
                kind: 'group',
                op: 'AND',
                children: [node, defaultCondition(builtinFields)],
              })
            }
          >
            <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> {labels.combineWith}
          </Button>
        </div>
      </div>
    );
  }

  const setChild = (idx: number, child: StructuralRule): void => {
    onChange({ ...node, children: node.children.map((c, i) => (i === idx ? child : c)) });
  };
  const removeChild = (idx: number): void => {
    const next = node.children.filter((_, i) => i !== idx);
    if (next.length === 0) onChange({ kind: 'all' });
    else if (next.length === 1 && next[0]) onChange(next[0]);
    else onChange({ ...node, children: next });
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select
          className="w-24"
          value={node.op}
          disabled={disabled}
          aria-label={labels.groupOperatorLabel}
          onChange={(e) => onChange({ ...node, op: e.target.value as 'AND' | 'OR' })}
        >
          <option value="AND">{labels.groupAll}</option>
          <option value="OR">{labels.groupAny}</option>
        </Select>
        <span className="text-xs text-muted-foreground">{labels.groupSuffix}</span>
      </div>
      <div className="flex flex-col gap-2 border-l-2 border-line pl-3">
        {node.children.map((child, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1">
              <RuleNode
                node={child}
                onChange={(c) => setChild(idx, c)}
                builtinFields={builtinFields}
                attributeFields={attributeFields}
                fieldOptions={fieldOptions}
                labels={labels}
                disabled={disabled}
                depth={depth + 1}
                t={t}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={disabled}
              aria-label={labels.removeChild}
              onClick={() => removeChild(idx)}
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() =>
              onChange({
                ...node,
                children: [...node.children, defaultCondition(builtinFields)],
              })
            }
          >
            <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> {labels.addChildCondition}
          </Button>
          {depth < 4 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...node,
                  children: [
                    ...node.children,
                    { kind: 'group', op: 'AND', children: [defaultCondition(builtinFields)] },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> {labels.addChildGroup}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConditionRow({
  condition,
  onChange,
  builtinFields,
  attributeFields,
  fieldOptions,
  labels,
  disabled,
  onRemove,
  t,
}: {
  condition: StructuralRuleCondition;
  onChange: (next: StructuralRule) => void;
  builtinFields: RuleBuilderBuiltinField[];
  attributeFields: RuleAttributeField[];
  fieldOptions: RuleFieldOptions;
  labels: Required<RuleBuilderLabels>;
  disabled: boolean;
  onRemove: () => void;
  t: (key: string) => string;
}): ReactNode {
  const numeric = isNumericField(condition.field, builtinFields);
  const ops = opsForField(condition.field, builtinFields);
  const options = condition.field.kind === 'builtin' ? fieldOptions[condition.field.key] : undefined;

  const onFieldChange = (selected: string): void => {
    const field: StructuralRuleField = selected.startsWith('attribute:')
      ? { kind: 'attribute', attributeKey: selected.slice('attribute:'.length) }
      : { kind: 'builtin', key: selected.slice('builtin:'.length) };
    const nextOps = opsForField(field, builtinFields);
    const op = nextOps.includes(condition.op) ? condition.op : (nextOps[0] ?? condition.op);
    onChange({ ...condition, field, op, values: [] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        className="w-44"
        value={fieldKey(condition.field)}
        disabled={disabled}
        aria-label={labels.fieldLabel}
        onChange={(e) => onFieldChange(e.target.value)}
      >
        <optgroup label={labels.builtinGroup}>
          {builtinFields.map((f) => (
            <option key={f.key} value={`builtin:${f.key}`}>
              {catalogLabel(t, `ruleBuilder.builtin.${f.key}`, f.label ?? f.key)}
            </option>
          ))}
        </optgroup>
        {attributeFields.length > 0 ? (
          <optgroup label={labels.attributeGroup}>
            {attributeFields.map((a) => (
              <option key={a.attributeKey} value={`attribute:${a.attributeKey}`}>
                {a.label}
              </option>
            ))}
          </optgroup>
        ) : null}
      </Select>
      <Select
        className="w-28"
        value={condition.op}
        disabled={disabled}
        aria-label={labels.operatorLabel}
        onChange={(e) => onChange({ ...condition, op: e.target.value })}
      >
        {ops.map((op) => (
          <option key={op} value={op}>
            {catalogLabel(t, `ruleBuilder.op.${op}`, op)}
          </option>
        ))}
      </Select>
      {options ? (
        <MultiSelect
          className="w-48"
          options={options}
          selected={condition.values.map(String)}
          onChange={(next) => onChange({ ...condition, values: next })}
          placeholder={labels.valuesPlaceholder}
          ariaLabel={labels.valuesLabel}
          disabled={disabled}
          searchable
          searchPlaceholder={labels.valuesSearchPlaceholder}
        />
      ) : (
        <Input
          className="w-48"
          value={valuesToText(condition.values)}
          disabled={disabled}
          aria-label={labels.valuesLabel}
          placeholder={numeric ? '0' : labels.valuesInputPlaceholder}
          onChange={(e) => onChange({ ...condition, values: textToValues(e.target.value, numeric) })}
        />
      )}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        aria-label={labels.removeCondition}
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3" aria-hidden="true" />
      </Button>
    </div>
  );
}