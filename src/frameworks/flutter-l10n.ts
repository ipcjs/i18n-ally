import path from 'path'
import fs from 'fs'
import YAML from 'js-yaml'
import { Framework } from './base'
import { File, LanguageId, Log } from '~/utils'
import { PubspecYAMLParser } from '~/packagesParsers'
import { DirStructure, KeyStyle } from '~/core'

class FlutterL10nFramework extends Framework {
  id= 'flutter-l10n'
  display= 'Flutter L10n'

  detection = {
    pubspecYAML: (_: string[], root: string) => {
      try {
        const filepath = path.resolve(root, PubspecYAMLParser.filename)
        if (!fs.existsSync(filepath))
          return false
        const yaml = YAML.load(File.readSync(filepath)) as any
        // In flutter 3.29, the generate field has been deprecated. Instead, use l10n.yaml to determine whether gen-l10n is enabled.
        // https://docs.flutter.dev/release/breaking-changes/flutter-generate-i10n-source
        if (typeof yaml?.flutter?.generate !== 'undefined')
          return !!yaml.flutter.generate

        const l10nYamlFile = path.resolve(root, 'l10n.yaml')
        if (fs.existsSync(l10nYamlFile))
          return true
      }
      catch (e) {
        Log.error(e)
      }
      return false
    },
  }

  languageIds: LanguageId[] = [
    'dart',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?<annotation>S\\.of\\([\\w.]+\\)[?!]?\\.(?<key>{key}))\\W',
    '(?<annotation>AppLocalizations\\.of\\([\\w.]+\\)[?!]?\\.(?<key>{key}))\\W',
  ]

  preferredKeystyle?: KeyStyle = 'flat'
  preferredDirStructure?: DirStructure = 'file'
  preferredLocalePaths?: string[] = ['lib/l10n']

  refactorTemplates(keypath: string) {
    return [
      `S.of(context).${keypath}`,
      `AppLocalizations.of(context).${keypath}`,
      keypath,
    ]
  }
}

export default FlutterL10nFramework
