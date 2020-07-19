import React, {useEffect, useRef} from 'react';
import c from 'classnames';

import {Container, Card} from '@ui/webapp';
import {X86CPU} from '@emulator/x86-cpu/X86CPU';
import {VGARenderLoopDriver} from '@emulator/x86-cpu/devices/Video/HTML/VGARenderLoopDriver';

import {ScreenHolder} from './ScreenHolder';
import {CodeEditorCard} from './cards/CodeEditorCard';

import {useEmulatorContext} from '../context/emulator-state/context';

export const RootContainer = () => {
  const {compilerOutput} = useEmulatorContext(
    ({state}) => ({
      compilerOutput: state.compilerOutput,
    }),
  );

  const screenRef = useRef<HTMLDivElement>();
  const cpuRef = useRef<X86CPU>();
  const {asm: asmResult} = compilerOutput;

  useEffect(
    () => {
      if (!screenRef.current || !asmResult || asmResult.isErr())
        return undefined;

      const cpu = new X86CPU;
      const binary = asmResult.unwrap().output.getBinary();

      cpu
        .attach(VGARenderLoopDriver, {screenElement: screenRef.current})
        .boot(Buffer.from(binary));

      cpuRef.current = cpu;

      return () => {
        cpu.release();
      };
    },
    [asmResult, screenRef.current],
  );

  const active = asmResult?.isOk();
  return (
    <section>
      <Container
        className={c(
          'l-repl-container',
          active && 'is-active',
        )}
      >
        <CodeEditorCard className='l-repl-editor' />
        {active && (
          <Card className='l-repl-output'>
            <ScreenHolder ref={screenRef} />
          </Card>
        )}
      </Container>
    </section>
  );
};

RootContainer.displayName = 'RootContainer';