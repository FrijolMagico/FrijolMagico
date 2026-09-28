import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const SRC = `${process.cwd()}/src/app/(core)/eventos/participaciones/_components`

const dialogs = [
  'create-activity-dialog.tsx',
  'update-activity-dialog.tsx',
  'create-exhibition-dialog.tsx',
  'update-exhibition-dialog.tsx'
]

describe('participation pseudonym selectors', () => {
  for (const dialog of dialogs) {
    test(`${dialog} renders the selected pseudonym label while keeping its ID as the value`, () => {
      const source = readFileSync(`${SRC}/${dialog}`, 'utf8')

      expect(source).toMatch(
        /const selectedPseudonym = (?:activePseudonyms|artistOptions)\.find\(\s*\(item\) => item\.id === selected\s*\)/
      )
      expect(source).toMatch(
        /<SelectValue placeholder='Elegir pseudónimo'>\s*\{selectedPseudonym\s*\?\s*`\$\{selectedPseudonym\.pseudonym\}\$\{selectedPseudonym\.isPrimary \? ' \(principal\)' : ''\}`\s*:\s*'Elegir pseudónimo'\s*\}/
      )
      expect(source).toMatch(
        /<SelectItem key=\{pseudonym\.id\} value=\{String\(pseudonym\.id\)\}>/
      )
    })
  }
})
