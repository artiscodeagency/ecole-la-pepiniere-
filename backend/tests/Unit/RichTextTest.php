<?php

namespace Tests\Unit;

use App\Services\RichText;
use PHPUnit\Framework\TestCase;

class RichTextTest extends TestCase
{
    public function test_the_editor_formatting_is_kept(): void
    {
        $html = '<h2>Titre</h2><p><strong>Gras</strong> et <em>italique</em></p><ul><li>Un</li></ul>'
            .'<blockquote><p>Citation</p></blockquote><p><a href="https://example.com">lien</a></p>';

        $this->assertSame(
            '<h2>Titre</h2><p><strong>Gras</strong> et <em>italique</em></p><ul><li>Un</li></ul>'
            .'<blockquote><p>Citation</p></blockquote><p><a href="https://example.com" rel="noopener noreferrer">lien</a></p>',
            RichText::sanitize($html),
        );
    }

    public function test_styles_iframes_and_forms_are_removed(): void
    {
        $this->assertSame(
            '<p>Texte</p>',
            RichText::sanitize('<p style="color:red">Texte</p><iframe src="https://x"></iframe><form><input></form><style>p{}</style>'),
        );
    }

    public function test_empty_paragraphs_count_as_empty(): void
    {
        $this->assertNull(RichText::sanitize('<p></p><p>&nbsp;</p>'));
        $this->assertTrue(RichText::isEmpty('<p> </p>'));
        $this->assertFalse(RichText::isEmpty('<p>a</p>'));
    }
}
