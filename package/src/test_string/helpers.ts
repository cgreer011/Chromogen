/* eslint-disable */
import { SelectorUpdate, Transaction, AtomUpdate, SetTransaction } from '../types/types';
/* eslint-enable */

/* ----- HELPER FUNCTIONS ----- */

function initializeAtoms(state: AtomUpdate[], current: boolean): string {
  return state.reduce(
    (initializers, { key, value, previous }) =>
      `${initializers}\t\t\tresult.current.set${key}(${JSON.stringify(
        current ? value : previous,
      )});\n\n`,
    '',
  );
}

function assertAtoms(updates: AtomUpdate[]): string {
  return updates.reduce(
    (assertions, { key, value }) =>
      `${assertions}\t\texpect(result.current.${key}Value).toStrictEqual(${JSON.stringify(
        value,
      )});\n\n`,
    '',
  );
}

// For the sake of easy reasoning, maintaining a distinction b/w selector "newValue" & atom "value"
// SelectorUpdate's "newValue" is already psuedo-polymorphic in set vs. get shadow methods
function assertSelectors(updates: SelectorUpdate[]): string {
  return updates.reduce(
    (assertions, { key, newValue }) =>
      `${assertions}\t\texpect(result.current.${key}Value).toStrictEqual(${JSON.stringify(
        newValue,
      )});\n\n`,
    '',
  );
}

/* ----- SETUP FUNCTIONS ----- */

export function importRecoilState(keyArray: string[]): string {
  return keyArray.reduce((fullStr, key) => `${fullStr}\t${key},\n`, '');
}

export function stateHook(keyArray: string[]): string {
  return keyArray.reduce(
    (fullStr, key) => `${fullStr}\tconst [${key}Value, set${key}] = useRecoilState(${key});\n`,
    '',
  );
}

export function valueHook(keyArray: string[]): string {
  return keyArray.reduce(
    (fullStr, key) => `${fullStr}\tconst ${key}Value = useRecoilValue(${key});\n`,
    '',
  );
}

export function returnState(keyArray: string[]): string {
  return keyArray.reduce((fullStr, key) => `${fullStr}\t\t${key}Value,\n\t\tset${key},\n`, '');
}

export function returnValue(keyArray: string[]): string {
  return keyArray.reduce((fullStr, key) => `${fullStr}\t\t${key}Value,\n`, '');
}

/* ----- INITIAL RENDER ----- */

export function testInitialize(initialRender: SelectorUpdate[]): string {
  return initialRender.reduce(
    (fullStr, { key, newValue }) => `${fullStr}\tit('${key} should initialize correctly', () => {
\t\texpect(result.current.${key}Value).toStrictEqual(${JSON.stringify(newValue)});
\t});\n\n`,
    '',
  );
}

/* ----- SELECTORS TEST ----- */

export function testSelectors(transactionArray: Transaction[]): string {
  return transactionArray.reduce((selectorTests, { state, updates }) => {
    const updatedAtoms = state.filter(({ updated }) => updated);
    const atomLen = updatedAtoms.length;

    return atomLen !== 0 && updates.length !== 0
      ? `${selectorTests}\tit('derive correct values when ${
          atomLen > 1
            ? updatedAtoms.reduce(
                (list, { key }, i) =>
                  `${list}${i === atomLen - 1 ? `and ${key} update` : `${key}, `}`,
                '',
              )
            : `${updatedAtoms[0].key} updates`
        }', () => {
\t\tconst { result } = renderRecoilHook(useStoreHook);
  
\t\tact(() => {
${initializeAtoms(state, true)}\t\t});
  
${assertSelectors(updates)}\t});\n\n`
      : selectorTests;
  }, '');
}

/* ----- SETTERS TEST ----- */

export function testSetters(setTransactionArray: SetTransaction[]): string {
  return setTransactionArray.reduce((setterTests, { state, setter }) => {
    const updatedAtoms = state.filter(({ updated }) => updated);

    // ternary check filters out transactions where no writeable selector fired
    return setter
      ? `${setterTests}\tit('${setter.key} should properly set state', () => {
\t\tconst { result } = renderRecoilHook(useStoreHook);
  
\t\tact(() => {
${initializeAtoms(state, false)}\t\t});
  
\t\tact(() => { 
\t\t\tresult.current.set${setter.key}(${JSON.stringify(setter.newValue)});
\t\t});
  
${assertAtoms(updatedAtoms)}\t});\n\n`
      : `${setterTests}`;
  }, '');
}
