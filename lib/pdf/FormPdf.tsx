import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11 },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', borderBottom: '1px solid #ddd', paddingVertical: 4 },
  cell: { flex: 1, paddingRight: 8 },
});

function renderSection(section: any) {
  const data = section.data || {};
  const keys = Object.keys(data);
  const hasStatus = keys.some(k => ['OK','Ikke OK','IR'].includes(String(data[k])));
  if (hasStatus) {
    return (
      <View>
        <View style={[styles.row, { fontWeight: 'bold' }]}>
          <Text style={[styles.cell]}>Felt</Text>
          <Text style={[styles.cell]}>Status</Text>
          <Text style={[styles.cell]}>Kommentar</Text>
        </View>
        {keys.map((k) => {
          const v = data[k];
          if (typeof v === 'string' && ['OK','Ikke OK','IR'].includes(v)) {
            const commentKey = 'kommentar';
            return (
              <View key={k} style={styles.row}>
                <Text style={styles.cell}>{k}</Text>
                <Text style={styles.cell}>{v}</Text>
                <Text style={styles.cell}>{data[commentKey] || ''}</Text>
              </View>
            );
          }
          return null;
        })}
      </View>
    );
  }
  return <Text>{JSON.stringify(data)}</Text>;
}

export function FormPdf({ form, sections }: { form: any; sections: Array<{section_key: string, data: any}> }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Kontrollskjema – {form.form_type}</Text>
        <Text>Title: {form.title || '-'}</Text>
        <Text>Status: {form.status}</Text>
        <Text>Oppdatert: {new Date(form.updated_at).toLocaleString()}</Text>
        {sections.map((s) => (
          <View key={s.section_key}>
            <Text style={styles.h2}>{s.section_key}</Text>
            {renderSection(s)}
          </View>
        ))}
      </Page>
    </Document>
  );
}
