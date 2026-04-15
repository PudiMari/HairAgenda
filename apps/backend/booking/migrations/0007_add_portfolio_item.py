from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0006_professionalblock'),
    ]

    operations = [
        migrations.CreateModel(
            name='PortfolioItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image_url', models.URLField(verbose_name='URL da Imagem')),
                ('title', models.CharField(max_length=100, verbose_name='Título')),
                ('category', models.CharField(
                    choices=[
                        ('corte', 'Corte'),
                        ('coloracao', 'Coloração'),
                        ('tratamento', 'Tratamento'),
                        ('penteado', 'Penteado'),
                        ('unhas', 'Unhas'),
                        ('maquiagem', 'Maquiagem'),
                        ('outro', 'Outro'),
                    ],
                    default='outro',
                    max_length=20,
                    verbose_name='Categoria',
                )),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Ordem')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('professional', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='portfolio_items',
                    to='booking.professionalprofile',
                )),
            ],
            options={
                'ordering': ['order', '-created_at'],
            },
        ),
    ]
